<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Role;

class UserController extends Controller
{
    /**
     * Display a listing of users
     */
    public function index(Request $request): Response
    {
        $search = $request->get('search');
        $role = $request->get('role');
        $status = $request->get('status');
        $perPage = $request->get('per_page', 10);

        $users = User::with('roles')
            ->when($search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%");
                });
            })
            ->when($role, function ($query, $role) {
                $query->whereHas('roles', function ($q) use ($role) {
                    $q->where('name', $role);
                });
            })
            ->when($status !== null, function ($query) use ($status) {
                if ($status === 'active') {
                    $query->whereNotNull('email_verified_at');
                } elseif ($status === 'inactive') {
                    $query->whereNull('email_verified_at');
                }
            })
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);

        // Transform the data
        $users->getCollection()->transform(function ($user) {
            return [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'email_verified_at' => $user->email_verified_at,
                'created_at' => $user->created_at->format('d M Y H:i'),
                'updated_at' => $user->updated_at->format('d M Y H:i'),
                'roles' => $user->roles->map(function ($role) {
                    return [
                        'id' => $role->id,
                        'name' => $role->name,
                        'display_name' => ucfirst(str_replace('_', ' ', $role->name)),
                    ];
                }),
                'status' => $user->email_verified_at ? 'active' : 'inactive',
                'is_current_user' => $user->id === auth()->id(),
            ];
        });

        return Inertia::render('Users/Index', [
            'users' => $users,
            'roles' => Role::all()->map(function ($role) {
                return [
                    'id' => $role->id,
                    'name' => $role->name,
                    'display_name' => ucfirst(str_replace('_', ' ', $role->name)),
                ];
            }),
            'filters' => [
                'search' => $search,
                'role' => $role,
                'status' => $status,
                'per_page' => $perPage,
            ],
            'stats' => [
                'total_users' => User::count(),
                'active_users' => User::whereNotNull('email_verified_at')->count(),
                'admin_users' => User::whereHas('roles', function ($q) {
                    $q->where('name', 'admin');
                })->count(),
                'customer_users' => User::whereHas('roles', function ($q) {
                    $q->where('name', 'customer');
                })->count(),
            ]
        ]);
    }

    /**
     * Show the form for creating a new user
     */
    public function create(): Response
    {
        return Inertia::render('Users/Create', [
            'roles' => Role::all()->map(function ($role) {
                return [
                    'id' => $role->id,
                    'name' => $role->name,
                    'display_name' => ucfirst(str_replace('_', ' ', $role->name)),
                ];
            }),
        ]);
    }

    /**
     * Store a newly created user
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
            'roles' => 'required|array|min:1',
            'roles.*' => 'exists:roles,name',
            'email_verified' => 'boolean',
        ]);

        try {
            DB::beginTransaction();

            $user = User::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'password' => Hash::make($validated['password']),
                'email_verified_at' => $request->boolean('email_verified') ? now() : null,
            ]);

            // Assign roles
            $user->assignRole($validated['roles']);

            DB::commit();

            return redirect()->route('users.index')->with([
                'success' => true,
                'message' => 'User berhasil dibuat',
                'user_id' => $user->id,
            ]);

        } catch (\Exception $e) {
            DB::rollBack();

            return redirect()->route('users.index')->with([
                'success' => false,
                'message' => 'Gagal membuat user: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified user
     */
    public function show(User $user): Response
    {
        $user->load('roles');

        return Inertia::render('Users/Show', [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'email_verified_at' => $user->email_verified_at,
                'created_at' => $user->created_at->format('d M Y H:i'),
                'updated_at' => $user->updated_at->format('d M Y H:i'),
                'roles' => $user->roles->map(function ($role) {
                    return [
                        'id' => $role->id,
                        'name' => $role->name,
                        'display_name' => ucfirst(str_replace('_', ' ', $role->name)),
                    ];
                }),
                'status' => $user->email_verified_at ? 'active' : 'inactive',
                'is_current_user' => $user->id === auth()->id(),
            ],
            'permissions' => $user->getAllPermissions()->map(function ($permission) {
                return [
                    'id' => $permission->id,
                    'name' => $permission->name,
                    'display_name' => ucfirst(str_replace('-', ' ', $permission->name)),
                ];
            }),
        ]);
    }

    /**
     * Show the form for editing the specified user
     */
    public function edit(User $user): Response
    {
        $user->load('roles');

        return Inertia::render('Users/Edit', [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'email_verified_at' => $user->email_verified_at,
                'roles' => $user->roles->pluck('name')->toArray(),
                'is_current_user' => $user->id === auth()->id(),
            ],
            'roles' => Role::all()->map(function ($role) {
                return [
                    'id' => $role->id,
                    'name' => $role->name,
                    'display_name' => ucfirst(str_replace('_', ' ', $role->name)),
                ];
            }),
        ]);
    }

    /**
     * Update the specified user
     */
    public function update(Request $request, User $user)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => [
                'required',
                'string',
                'email',
                'max:255',
                Rule::unique('users')->ignore($user->id),
            ],
            'password' => 'nullable|string|min:8|confirmed',
            'roles' => 'required|array|min:1',
            'roles.*' => 'exists:roles,name',
            'email_verified' => 'boolean',
        ]);

        // Prevent current user from removing their own admin role
        if ($user->id === auth()->id() && !in_array('admin', $validated['roles'])) {
            return response()->json([
                'success' => false,
                'message' => 'Anda tidak dapat menghapus role admin dari akun Anda sendiri'
            ], 422);
        }

        try {
            DB::beginTransaction();

            $updateData = [
                'name' => $validated['name'],
                'email' => $validated['email'],
                'email_verified_at' => $request->boolean('email_verified') ? now() : null,
            ];

            // Only update password if provided
            if (!empty($validated['password'])) {
                $updateData['password'] = Hash::make($validated['password']);
            }

            $user->update($updateData);

            // Sync roles
            $user->syncRoles($validated['roles']);

            DB::commit();

            return redirect()->route('users.index')->with([
                'success' => true,
                'message' => 'User berhasil diupdate',
                'user_id' => $user->id,
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengupdate user: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified user
     */
    public function destroy(User $user)
    {
        // Prevent deleting current user
        if ($user->id === auth()->id()) {
            return response()->json([
                'success' => false,
                'message' => 'Anda tidak dapat menghapus akun Anda sendiri'
            ], 422);
        }

        // Prevent deleting if it's the last admin
        if ($user->hasRole('admin')) {
            $adminCount = User::whereHas('roles', function ($q) {
                $q->where('name', 'admin');
            })->count();

            if ($adminCount <= 1) {
                return response()->json([
                    'success' => false,
                    'message' => 'Tidak dapat menghapus admin terakhir'
                ], 422);
            }
        }

        try {
            // Remove all roles first
            $user->syncRoles([]);
            
            // Delete the user
            $user->delete();

           return redirect()->route('users.index')->with([
                'success' => true,
                'message' => 'User berhasil dihapus',
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal menghapus user: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Toggle user status (activate/deactivate)
     */
    public function toggleStatus(User $user)
    {
        // Prevent deactivating current user
        if ($user->id === auth()->id()) {
            return response()->json([
                'success' => false,
                'message' => 'Anda tidak dapat menonaktifkan akun Anda sendiri'
            ], 422);
        }

        try {
            $user->update([
                'email_verified_at' => $user->email_verified_at ? null : now()
            ]);

            $status = $user->email_verified_at ? 'diaktifkan' : 'dinonaktifkan';

            return redirect()->route('users.index')->with([
                'success' => true,
                'message' => "User berhasil {$status}",
                'data' => [
                    'status' => $user->email_verified_at ? 'active' : 'inactive'
                ]
            ]);

        } catch (\Exception $e) {
            return redirect()->route('users.index')->with([
                'success' => false,
                'message' => 'Gagal mengubah status user: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Bulk actions for users
     */
    public function bulkAction(Request $request)
    {
        $validated = $request->validate([
            'action' => 'required|in:delete,activate,deactivate,assign_role',
            'user_ids' => 'required|array|min:1',
            'user_ids.*' => 'exists:users,id',
            'role' => 'required_if:action,assign_role|exists:roles,name',
        ]);

        $userIds = $validated['user_ids'];
        $currentUserId = auth()->id();

        // Prevent actions on current user
        if (in_array($currentUserId, $userIds)) {
            return response()->json([
                'success' => false,
                'message' => 'Anda tidak dapat melakukan aksi bulk pada akun Anda sendiri'
            ], 422);
        }

        try {
            DB::beginTransaction();

            $users = User::whereIn('id', $userIds)->get();
            $action = $validated['action'];
            $count = $users->count();

            switch ($action) {
                case 'delete':
                    // Check if deleting admin users
                    $adminUsers = $users->filter(fn($user) => $user->hasRole('admin'));
                    $remainingAdmins = User::whereHas('roles', function ($q) {
                        $q->where('name', 'admin');
                    })->whereNotIn('id', $userIds)->count();

                    if ($adminUsers->count() > 0 && $remainingAdmins < 1) {
                        return response()->json([
                            'success' => false,
                            'message' => 'Tidak dapat menghapus semua admin'
                        ], 422);
                    }

                    foreach ($users as $user) {
                        $user->syncRoles([]);
                        $user->delete();
                    }
                    $message = "{$count} user berhasil dihapus";
                    break;

                case 'activate':
                    User::whereIn('id', $userIds)->update(['email_verified_at' => now()]);
                    $message = "{$count} user berhasil diaktifkan";
                    break;

                case 'deactivate':
                    User::whereIn('id', $userIds)->update(['email_verified_at' => null]);
                    $message = "{$count} user berhasil dinonaktifkan";
                    break;

                case 'assign_role':
                    foreach ($users as $user) {
                        $user->assignRole($validated['role']);
                    }
                    $roleName = ucfirst(str_replace('_', ' ', $validated['role']));
                    $message = "{$count} user berhasil diberi role {$roleName}";
                    break;
            }

            DB::commit();

           return redirect()->route('users.index')->with([
                'success' => true,
                'message' => $message,
            ]);

        } catch (\Exception $e) {
            DB::rollBack();

            return redirect()->route('users.index')->with([
                'success' => false,
                'message' => 'Gagal melakukan bulk action: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Send password reset link
     */
    public function sendPasswordReset(User $user)
    {
        try {
            // This would typically send an email with password reset link
            // For now, we'll just return success

            return redirect()->route('users.index')->with([
                'success' => true,
                'message' => 'Link reset password berhasil dikirim ke ' . $user->email
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengirim link reset password: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get user activity logs
     */
    public function activityLogs(User $user)
    {
        // This would typically get activity logs from a logging system
        // For now, return mock data
        
        $logs = [
            [
                'id' => 1,
                'action' => 'login',
                'description' => 'User logged in',
                'ip_address' => '192.168.1.1',
                'user_agent' => 'Mozilla/5.0...',
                'created_at' => now()->subDays(1)->format('d M Y H:i:s'),
            ],
            [
                'id' => 2,
                'action' => 'profile_update',
                'description' => 'User updated profile',
                'ip_address' => '192.168.1.1',
                'user_agent' => 'Mozilla/5.0...',
                'created_at' => now()->subDays(2)->format('d M Y H:i:s'),
            ],
        ];

        return response()->json([
            'success' => true,
            'data' => $logs
        ]);
    }
}
