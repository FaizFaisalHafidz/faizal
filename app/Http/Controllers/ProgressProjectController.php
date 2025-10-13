<?php

namespace App\Http\Controllers;

use App\Models\DataProject;
use App\Models\ProgressProject;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;
use Inertia\Response;

class ProgressProjectController extends Controller
{
    /**
     * Display a listing of tasks for a project
     */
    public function index(DataProject $project): Response
    {
        $tasks = $project->progressTasks()
            ->orderedForDisplay()
            ->get()
            ->map(function ($task) {
                $task->can_start = $task->canStart();
                $task->is_overdue = $task->isOverdue();
                $task->days_overdue = $task->getDaysOverdue();
                $task->estimated_completion = $task->getEstimatedCompletionDate();
                return $task;
            });

        return Inertia::render('Projects/Tasks/Index', [
            'project' => $project,
            'tasks' => $tasks,
            'kategoriOptions' => ProgressProject::KATEGORI_TASK,
            'statusOptions' => ProgressProject::STATUS_TASK,
            'qualityOptions' => ProgressProject::QUALITY_STATUS,
        ]);
    }

    /**
     * Store a newly created task
     */
    public function store(Request $request, DataProject $project)
    {
        $validator = Validator::make($request->all(), [
            'nama_task' => 'required|string|max:255',
            'deskripsi_task' => 'nullable|string',
            'kategori_task' => 'required|in:' . implode(',', array_keys(ProgressProject::KATEGORI_TASK)),
            'durasi_hari' => 'required|integer|min:1|max:365',
            'durasi_jam' => 'nullable|integer|min:1|max:24',
            'predecessor_tasks' => 'nullable|array',
            'predecessor_tasks.*' => 'integer|exists:tt_progress_project,id',
            'pic_pengerjaan' => 'nullable|string|max:255',
            'team_pengerjaan' => 'nullable|array',
            'peralatan_dibutuhkan' => 'nullable|string',
            'material_dibutuhkan' => 'nullable|string',
            'estimasi_biaya_task' => 'nullable|numeric|min:0',
            'warna_display' => 'nullable|string|size:7|regex:/^#[0-9A-F]{6}$/i',
            'urutan_tampil' => 'nullable|integer|min:0',
            'is_critical' => 'nullable|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            DB::beginTransaction();

            // Debug logging
            error_log('Request data: ' . json_encode($request->all()));

            // Validate predecessor tasks belong to same project
            if ($request->has('predecessor_tasks') && !empty($request->predecessor_tasks)) {
                $validPredecessors = ProgressProject::whereIn('id', $request->predecessor_tasks)
                    ->where('project_id', $project->id)
                    ->count();
                
                if ($validPredecessors !== count($request->predecessor_tasks)) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Invalid predecessor tasks'
                    ], 422);
                }
            }

            // Set urutan_tampil if not provided
            if (!$request->has('urutan_tampil') || $request->urutan_tampil === null) {
                $maxOrder = $project->progressTasks()->max('urutan_tampil') ?? 0;
                $request->merge(['urutan_tampil' => $maxOrder + 1]);
            }

            $taskData = $request->all();
            $taskData['project_id'] = $project->id;
            $taskData['created_by'] = auth()->user()->name ?? 'System';
            $taskData['warna_display'] = $taskData['warna_display'] ?? '#FF4433';

            error_log('Task data before create: ' . json_encode($taskData));

            $task = ProgressProject::create($taskData);

            error_log('Created task: ' . json_encode($task->toArray()));

            // Auto-set dependencies if not provided by user
            if (empty($request->predecessor_tasks)) {
                $this->autoSetTaskDependencies($task, $project);
            }

            // Update successor tasks if needed
            if ($request->has('predecessor_tasks') && !empty($request->predecessor_tasks)) {
                $this->updateSuccessorTasks($request->predecessor_tasks, $task->id);
            }

            // Recalculate CPM
            $project->calculateCPM();

            DB::commit();

            return redirect()->back()->with([
                'project' => $project->id,
                'task' => $task->id
            ])->with('success', 'Task berhasil dibuat');

        } catch (\Exception $e) {
            DB::rollback();
          return redirect()->back()->withErrors([
                'message' => 'Gagal membuat task: ' . $e->getMessage()
            ])->withInput();
        }
    }

    /**
     * Display the specified task
     */
    public function show(DataProject $project, ProgressProject $task): Response
    {
        // Ensure task belongs to project
        if ($task->project_id !== $project->id) {
            abort(404);
        }

        $task->load('project');
        $task->can_start = $task->canStart();
        $task->is_overdue = $task->isOverdue();
        $task->days_overdue = $task->getDaysOverdue();
        $task->estimated_completion = $task->getEstimatedCompletionDate();
        $task->predecessor_tasks_data = $task->getPredecessorTasks();
        $task->successor_tasks_data = $task->getSuccessorTasks();

        return Inertia::render('Projects/Tasks/Show', [
            'project' => $project,
            'task' => $task,
            'kategoriOptions' => ProgressProject::KATEGORI_TASK,
            'statusOptions' => ProgressProject::STATUS_TASK,
            'qualityOptions' => ProgressProject::QUALITY_STATUS,
        ]);
    }

    /**
     * Update the specified task
     */
    public function update(Request $request, DataProject $project, ProgressProject $task): JsonResponse
    {
        // Ensure task belongs to project
        if ($task->project_id !== $project->id) {
            return response()->json(['success' => false, 'message' => 'Task not found'], 404);
        }

        $validator = Validator::make($request->all(), [
            'nama_task' => 'required|string|max:255',
            'deskripsi_task' => 'nullable|string',
            'kategori_task' => 'required|in:' . implode(',', array_keys(ProgressProject::KATEGORI_TASK)),
            'durasi_hari' => 'required|integer|min:1|max:365',
            'durasi_jam' => 'nullable|integer|min:1|max:24',
            'predecessor_tasks' => 'nullable|array',
            'predecessor_tasks.*' => 'integer|exists:tt_progress_project,id',
            'status_task' => 'required|in:' . implode(',', array_keys(ProgressProject::STATUS_TASK)),
            'progress_percentage' => 'nullable|numeric|min:0|max:100',
            'pic_pengerjaan' => 'nullable|string|max:255',
            'team_pengerjaan' => 'nullable|array',
            'peralatan_dibutuhkan' => 'nullable|string',
            'material_dibutuhkan' => 'nullable|string',
            'quality_status' => 'nullable|in:' . implode(',', array_keys(ProgressProject::QUALITY_STATUS)),
            'catatan_quality' => 'nullable|string',
            'catatan_progress' => 'nullable|string',
            'estimasi_biaya_task' => 'nullable|numeric|min:0',
            'biaya_aktual_task' => 'nullable|numeric|min:0',
            'warna_display' => 'nullable|string|size:7|regex:/^#[0-9A-F]{6}$/i',
            'urutan_tampil' => 'nullable|integer|min:0',
            'tanggal_mulai_rencana' => 'nullable|date',
            'tanggal_selesai_rencana' => 'nullable|date|after_or_equal:tanggal_mulai_rencana',
            'is_critical' => 'nullable|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            DB::beginTransaction();

            // Validate predecessor tasks
            if ($request->has('predecessor_tasks') && !empty($request->predecessor_tasks)) {
                // Don't allow self-reference
                if (in_array($task->id, $request->predecessor_tasks)) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Task cannot be predecessor of itself'
                    ], 422);
                }

                $validPredecessors = ProgressProject::whereIn('id', $request->predecessor_tasks)
                    ->where('project_id', $project->id)
                    ->count();
                
                if ($validPredecessors !== count($request->predecessor_tasks)) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Invalid predecessor tasks'
                    ], 422);
                }
            }

            $oldPredecessors = $task->predecessor_tasks ?? [];
            
            $taskData = $request->all();
            $taskData['updated_by'] = auth()->user()->name ?? 'System';

            $task->update($taskData);

            // Update successor relationships
            $this->updateSuccessorRelationships($oldPredecessors, $request->predecessor_tasks ?? [], $task->id);

            // Recalculate CPM if dependencies or duration changed
            if ($task->wasChanged(['predecessor_tasks', 'durasi_hari'])) {
                $project->calculateCPM();
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Task berhasil diupdate',
                'data' => $task->fresh()
            ]);

        } catch (\Exception $e) {
            DB::rollback();
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengupdate task: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified task
     */
    public function destroy(DataProject $project, ProgressProject $task)
    {
        // Ensure task belongs to project
        if ($task->project_id !== $project->id) {
            return response()->json(['success' => false, 'message' => 'Task not found'], 404);
        }

        try {
            DB::beginTransaction();

            // Remove this task from other tasks' predecessor/successor lists
            $this->removeTaskFromRelationships($task);

            // Delete associated files
            if ($task->foto_progress) {
                foreach ($task->foto_progress as $foto) {
                    Storage::disk('public')->delete($foto);
                }
            }

            $task->delete();

            // Recalculate CPM
            $project->calculateCPM();

            DB::commit();

           return redirect()->back()->with('success', 'Task berhasil dihapus');

        } catch (\Exception $e) {
            DB::rollback();
            return response()->json([
                'success' => false,
                'message' => 'Gagal menghapus task: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Start a task
     */
    public function startTask(Request $request, DataProject $project, ProgressProject $task)
    {
        if ($task->project_id !== $project->id) {
            return response()->json(['success' => false, 'message' => 'Task not found'], 404);
        }

        if (!$task->canStart()) {
            return response()->json([
                'success' => false,
                'message' => 'Task tidak bisa dimulai. Pastikan semua predecessor task sudah selesai.'
            ], 422);
        }

        try {
            $task->startTask();

            return redirect()->back()->with([
                'project' => $project->id,
                'task' => $task->id
            ])->with('success', 'Task berhasil dimulai');

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal memulai task: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Complete a task
     */
    public function completeTask(Request $request, DataProject $project, ProgressProject $task)
    {
        if ($task->project_id !== $project->id) {
            return response()->json(['success' => false, 'message' => 'Task not found'], 404);
        }

        $validator = Validator::make($request->all(), [
            'catatan_progress' => 'nullable|string',
            'biaya_aktual_task' => 'nullable|numeric|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            // Update additional fields if provided
            if ($request->has('catatan_progress')) {
                $task->catatan_progress = $request->catatan_progress;
            }

            if ($request->has('biaya_aktual_task')) {
                $task->biaya_aktual_task = $request->biaya_aktual_task;
            }

            // Save the additional fields first
            $task->save();

            // Complete the task (this will also update project progress)
            $task->completeTask();

            return redirect()->back()->with('success', 'Task berhasil diselesaikan');

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal menyelesaikan task: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update task progress
     */
    public function updateProgress(Request $request, DataProject $project, ProgressProject $task): JsonResponse
    {
        if ($task->project_id !== $project->id) {
            return response()->json(['success' => false, 'message' => 'Task not found'], 404);
        }

        $validator = Validator::make($request->all(), [
            'progress_percentage' => 'required|numeric|min:0|max:100',
            'catatan_progress' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            if ($request->has('catatan_progress')) {
                $task->catatan_progress = $request->catatan_progress;
            }

            $task->updateProgress($request->progress_percentage);

            return response()->json([
                'success' => true,
                'message' => 'Progress berhasil diupdate',
                'data' => $task->fresh()
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengupdate progress: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Quality check for task
     */
    public function qualityCheck(Request $request, DataProject $project, ProgressProject $task)
    {
        if ($task->project_id !== $project->id) {
            return response()->json(['success' => false, 'message' => 'Task not found'], 404);
        }

        $validator = Validator::make($request->all(), [
            'quality_status' => 'required|in:' . implode(',', array_keys(ProgressProject::QUALITY_STATUS)),
            'catatan_quality' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $task->quality_status = $request->quality_status;
            $task->catatan_quality = $request->catatan_quality;
            $task->updated_by = auth()->user()->name ?? 'System';

            // If quality failed, revert task status
            if ($request->quality_status === 'failed' || $request->quality_status === 'rework') {
                $task->status_task = 'in_progress';
                $task->progress_percentage = 50; // Reset to 50% for rework
            }

            $task->save();

           
            return redirect()->back()->with([
                'project' => $project->id,
                'task' => $task->id
            ])->with('success', 'Quality check berhasil diupdate');

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengupdate quality check: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Upload progress photos
     */
    public function uploadPhoto(Request $request, DataProject $project, ProgressProject $task)
    {
        if ($task->project_id !== $project->id) {
            return response()->json(['success' => false, 'message' => 'Task not found'], 404);
        }

        $validator = Validator::make($request->all(), [
            'photos' => 'required|array|max:5',
            'photos.*' => 'image|mimes:jpeg,png,jpg|max:2048',
            'description' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $uploadedPhotos = [];
            $existingPhotos = $task->foto_progress ?? [];

            foreach ($request->file('photos') as $photo) {
                $path = $photo->store('projects/progress', 'public');
                $uploadedPhotos[] = $path;
            }

            $task->foto_progress = array_merge($existingPhotos, $uploadedPhotos);
            
            if ($request->has('description')) {
                $task->catatan_progress = $request->description;
            }

            $task->save();

            return redirect()->back()->with([
                'project' => $project->id,
                'task' => $task->id
            ])->with('success', 'Foto berhasil diupload');

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengupload foto: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Bulk update tasks
     */
    public function bulkUpdate(Request $request, DataProject $project): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'task_ids' => 'required|array',
            'task_ids.*' => 'integer|exists:tt_progress_project,id',
            'action' => 'required|in:start,complete,update_status,delete',
            'data' => 'nullable|array',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            DB::beginTransaction();

            $tasks = ProgressProject::whereIn('id', $request->task_ids)
                ->where('project_id', $project->id)
                ->get();

            if ($tasks->count() !== count($request->task_ids)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Some tasks not found or don\'t belong to this project'
                ], 422);
            }

            $updatedCount = 0;

            foreach ($tasks as $task) {
                switch ($request->action) {
                    case 'start':
                        if ($task->canStart()) {
                            $task->startTask();
                            $updatedCount++;
                        }
                        break;

                    case 'complete':
                        $task->completeTask();
                        $updatedCount++;
                        break;

                    case 'update_status':
                        if (isset($request->data['status'])) {
                            $task->status_task = $request->data['status'];
                            $task->save();
                            $updatedCount++;
                        }
                        break;

                    case 'delete':
                        $this->removeTaskFromRelationships($task);
                        $task->delete();
                        $updatedCount++;
                        break;
                }
            }

            // Recalculate CPM
            $project->calculateCPM();

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => "{$updatedCount} task berhasil diupdate",
                'data' => ['updated_count' => $updatedCount]
            ]);

        } catch (\Exception $e) {
            DB::rollback();
            return response()->json([
                'success' => false,
                'message' => 'Gagal melakukan bulk update: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Reorder tasks
     */
    public function reorder(Request $request, DataProject $project): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'task_orders' => 'required|array',
            'task_orders.*.id' => 'required|integer|exists:tt_progress_project,id',
            'task_orders.*.urutan_tampil' => 'required|integer|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            DB::beginTransaction();

            foreach ($request->task_orders as $order) {
                ProgressProject::where('id', $order['id'])
                    ->where('project_id', $project->id)
                    ->update(['urutan_tampil' => $order['urutan_tampil']]);
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Urutan task berhasil diupdate'
            ]);

        } catch (\Exception $e) {
            DB::rollback();
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengupdate urutan: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Toggle manual critical status for a task
     */
    public function toggleCritical(Request $request, DataProject $project, ProgressProject $task)
    {
        if ($task->project_id !== $project->id) {
            return response()->json(['success' => false, 'message' => 'Task not found'], 404);
        }

        $validator = Validator::make($request->all(), [
            'is_critical' => 'required|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            // Simply update the critical status
            $task->is_critical = $request->is_critical;
            $task->save();

            // Don't recalculate CPM immediately to preserve manual setting
            // CPM will be recalculated when other changes happen

            return redirect()->back()->with('success', 'Status critical berhasil diupdate');

        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Gagal mengupdate status critical: ' . $e->getMessage());
        }
    }

    /**
     * Helper method to auto-set task dependencies based on logical workflow (PDM Network)
     * Supports parallel activities and multiple predecessors like CPM algorithm
     */
    private function autoSetTaskDependencies(ProgressProject $task, DataProject $project): void
    {
        // Get logical dependencies based on CPM network rules
        $dependencies = $this->getLogicalDependencies($task, $project);
        
        if (!empty($dependencies)) {
            // Store old dependencies for cleanup
            $oldDependencies = $task->predecessor_tasks ?? [];
            
            // Set new dependencies
            $task->predecessor_tasks = $dependencies;
            $task->save();
            
            // Update successor relationships
            $this->updateSuccessorRelationships($oldDependencies, $dependencies, $task->id);
            
            // Log the dependency setting for debugging
            Log::info("Auto-set dependencies for task: {$task->nama_task}", [
                'task_id' => $task->id,
                'old_dependencies' => $oldDependencies,
                'new_dependencies' => $dependencies,
                'dependency_names' => $this->getDependencyNames($dependencies, $project)
            ]);
        }
    }
    
    /**
     * Helper to get dependency names for logging
     */
    private function getDependencyNames(array $dependencyIds, DataProject $project): array
    {
        return $project->progressTasks()
            ->whereIn('id', $dependencyIds)
            ->pluck('nama_task', 'id')
            ->toArray();
    }

    /**
     * Get logical dependencies for a task based on paint workflow (PDM Network)
     * Following CPM algorithm with proper parallel activities and multiple dependencies
     */
    private function getLogicalDependencies(ProgressProject $task, DataProject $project): array
    {
        $taskName = strtolower(trim($task->nama_task));
        $allTasks = $project->progressTasks()->orderBy('urutan_tampil')->get();
        
        // Define logical workflow for paint project following PDM Network
        // Based on the provided CPM structure with proper dependencies
        $workflowRules = [
            // A - Start node
            'bongkar body' => [], 
            
            // B and C can run in parallel after A
            'repair' => ['bongkar body'], 
            'repair body' => ['bongkar body'], 
            'pembersihan sasis' => ['bongkar body'], 
            
            // D depends on both B and C (merge point)
            'pengampelasan' => ['repair', 'pembersihan sasis'], 
            'pengampelasan' => ['repair body', 'pembersihan sasis'], 
            
            // E depends on D
            'pembersihan body' => ['pengampelasan'], 
            'pembersihan' => ['pengampelasan'], 
            
            // F depends on E
            'aplikasi poxy' => ['pembersihan body', 'pembersihan'], 
            'poxy' => ['pembersihan body', 'pembersihan'], 
            'foxy' => ['pembersihan body', 'pembersihan'], 
            
            // G and H can run in parallel after F
            'base coat' => ['aplikasi poxy', 'poxy', 'foxy'], 
            'base' => ['aplikasi poxy', 'poxy', 'foxy'], 
            'pencampuran cat' => ['aplikasi poxy', 'poxy', 'foxy'], 
            
            // I depends on both G and H (merge point)
            'color coat' => ['base coat', 'pencampuran cat'], 
            'color coat' => ['base', 'pencampuran cat'], 
            'cat warna' => ['base coat', 'pencampuran cat'], 
            'cat warna' => ['base', 'pencampuran cat'], 
            
            // J depends on I
            'clear coat' => ['color coat', 'cat warna'], 
            'clear' => ['color coat', 'cat warna'], 
            
            // K and L can start after J
            'pemasangan body' => ['clear coat', 'clear'], 
            'quality check' => ['clear coat', 'clear'], 
            'cek kualitas' => ['clear coat', 'clear'], 
            
            // M depends on both K and L (final merge)
            'final review' => ['pemasangan body', 'quality check'], 
            'final review' => ['pemasangan body', 'cek kualitas'], 
        ];

        $dependencyTaskCodes = [];
        
        // Check for exact match first
        if (isset($workflowRules[$taskName])) {
            $requiredPredecessors = $workflowRules[$taskName];
        } else {
            // Check for partial matches (fuzzy matching)
            $requiredPredecessors = [];
            foreach ($workflowRules as $ruleName => $ruleDependencies) {
                if (str_contains($taskName, $ruleName) || str_contains($ruleName, $taskName)) {
                    $requiredPredecessors = $ruleDependencies;
                    break;
                }
            }
        }
        
        // Find actual task codes for the required predecessors
        foreach ($requiredPredecessors as $predecessorName) {
            $predecessorNameLower = strtolower(trim($predecessorName));
            
            foreach ($allTasks as $candidateTask) {
                $candidateNameLower = strtolower(trim($candidateTask->nama_task));
                
                if ($candidateNameLower === $predecessorNameLower ||
                    str_contains($candidateNameLower, $predecessorNameLower) ||
                    str_contains($predecessorNameLower, $candidateNameLower)) {
                    $dependencyTaskCodes[] = $candidateTask->task_code;
                    break;
                }
            }
        }

        return array_unique($dependencyTaskCodes);
    }

    /**
     * Helper method to update successor tasks
     */
    private function updateSuccessorTasks(array $predecessorIds, int $taskId): void
    {
        foreach ($predecessorIds as $predecessorId) {
            $predecessor = ProgressProject::find($predecessorId);
            if ($predecessor) {
                $successors = $predecessor->successor_tasks ?? [];
                if (!in_array($taskId, $successors)) {
                    $successors[] = $taskId;
                    $predecessor->successor_tasks = $successors;
                    $predecessor->save();
                }
            }
        }
    }

    /**
     * Helper method to update successor relationships
     */
    private function updateSuccessorRelationships(array $oldPredecessors, array $newPredecessors, int $taskId): void
    {
        // Remove task from old predecessors' successor lists
        $removedPredecessors = array_diff($oldPredecessors, $newPredecessors);
        foreach ($removedPredecessors as $predecessorId) {
            $predecessor = ProgressProject::find($predecessorId);
            if ($predecessor) {
                $successors = $predecessor->successor_tasks ?? [];
                $successors = array_filter($successors, fn($id) => $id !== $taskId);
                $predecessor->successor_tasks = array_values($successors);
                $predecessor->save();
            }
        }

        // Add task to new predecessors' successor lists
        $addedPredecessors = array_diff($newPredecessors, $oldPredecessors);
        $this->updateSuccessorTasks($addedPredecessors, $taskId);
    }

    /**
     * Helper method to remove task from all relationships
     */
    private function removeTaskFromRelationships(ProgressProject $task): void
    {
        // Remove from all tasks' predecessor lists
        ProgressProject::where('project_id', $task->project_id)
            ->whereJsonContains('predecessor_tasks', $task->id)
            ->get()
            ->each(function ($relatedTask) use ($task) {
                $predecessors = $relatedTask->predecessor_tasks ?? [];
                $predecessors = array_filter($predecessors, fn($id) => $id !== $task->id);
                $relatedTask->predecessor_tasks = array_values($predecessors);
                $relatedTask->save();
            });

        // Remove from all tasks' successor lists
        ProgressProject::where('project_id', $task->project_id)
            ->whereJsonContains('successor_tasks', $task->id)
            ->get()
            ->each(function ($relatedTask) use ($task) {
                $successors = $relatedTask->successor_tasks ?? [];
                $successors = array_filter($successors, fn($id) => $id !== $task->id);
                $relatedTask->successor_tasks = array_values($successors);
                $relatedTask->save();
            });
    }
}
