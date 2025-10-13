<?php

namespace App\Console\Commands;

use App\Models\DataProject;
use App\Models\ProgressProject;
use Illuminate\Console\Command;

class FixTaskDependencies extends Command
{
    protected $signature = 'fix:task-dependencies {project_id}';
    protected $description = 'Fix task dependencies for proper CPM calculation';

    public function handle()
    {
        $projectId = $this->argument('project_id');
        
        $project = DataProject::find($projectId);
        if (!$project) {
            $this->error("Project with ID {$projectId} not found");
            return 1;
        }

        $this->info("Fixing task dependencies for project: {$project->nama_project}");

        // Get all tasks ordered by urutan_tampil
        $tasks = $project->progressTasks()->orderBy('urutan_tampil')->get();

        if ($tasks->isEmpty()) {
            $this->error('No tasks found in this project');
            return 1;
        }

        $this->info("Found {$tasks->count()} tasks");

        // Define logical dependencies based on paint workflow
        $dependencies = $this->getLogicalDependencies($tasks);

        // Apply dependencies
        foreach ($tasks as $task) {
            $taskName = strtolower($task->nama_task);
            
            // Clear existing dependencies
            $task->predecessor_tasks = [];
            $task->successor_tasks = [];

            // Apply logical dependencies
            if (isset($dependencies[$taskName])) {
                $predecessors = [];
                foreach ($dependencies[$taskName] as $predecessorName) {
                    $predecessor = $tasks->first(function($t) use ($predecessorName) {
                        return strtolower($t->nama_task) === $predecessorName;
                    });
                    
                    if ($predecessor) {
                        $predecessors[] = $predecessor->id;
                    }
                }
                
                if (!empty($predecessors)) {
                    $task->predecessor_tasks = $predecessors;
                    $this->info("Set predecessors for '{$task->nama_task}': " . implode(', ', $predecessors));
                }
            }

            $task->save();
        }

        // Update successor tasks
        $this->updateSuccessorTasks($tasks);

        // Recalculate CPM
        $this->info("Recalculating CPM...");
        $project->calculateCPM();

        // Show results
        $this->showResults($tasks->fresh());

        $this->info("Task dependencies fixed successfully!");
        return 0;
    }

    private function getLogicalDependencies($tasks): array
    {
        // Define logical workflow for paint project
        return [
            'repair body' => ['bongkar body'],
            'pengampelasan' => ['repair body'],
            'pembersihan' => ['pengampelasan'],
            'aplikasi poxy' => ['pembersihan'],
            'color coat' => ['aplikasi poxy'],
            'clear coat' => ['color coat'],
            'cek kualitas' => ['clear coat'],
            'pemasangan body' => ['cek kualitas'],
            'cat bak mesin' => ['bongkar body'], // Can run parallel after bongkar
        ];
    }

    private function updateSuccessorTasks($tasks): void
    {
        foreach ($tasks as $task) {
            if (!empty($task->predecessor_tasks)) {
                foreach ($task->predecessor_tasks as $predecessorId) {
                    $predecessor = $tasks->firstWhere('id', $predecessorId);
                    if ($predecessor) {
                        $successors = $predecessor->successor_tasks ?? [];
                        if (!in_array($task->id, $successors)) {
                            $successors[] = $task->id;
                            $predecessor->successor_tasks = $successors;
                            $predecessor->save();
                        }
                    }
                }
            }
        }
    }

    private function showResults($tasks): void
    {
        $this->info("\n=== CPM Calculation Results ===");
        
        $headers = ['Task', 'ES', 'EF', 'LS', 'LF', 'Float', 'Critical'];
        $rows = [];

        foreach ($tasks as $task) {
            $rows[] = [
                $task->nama_task,
                $task->early_start,
                $task->early_finish,
                $task->late_start,
                $task->late_finish,
                $task->total_float,
                $task->is_critical ? 'YES' : 'NO'
            ];
        }

        $this->table($headers, $rows);

        $criticalTasks = $tasks->where('is_critical', true);
        $this->info("\nCritical Path: " . $criticalTasks->pluck('nama_task')->implode(' → '));
        $this->info("Project Duration: " . $tasks->max('early_finish') . " days");
    }
}
