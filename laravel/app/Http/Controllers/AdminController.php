<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Product;
use App\Models\Deposit;
use App\Models\Ticket;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AdminController extends Controller
{
    public function dashboard()
    {
        $totalUsers = User::where('role', 'seller')->count();
        $totalOrders = Order::count();
        $totalDeposits = Deposit::where('status', 'approved')->sum('amount');
        $pendingOrders = Order::where('status', 'pending')->count();
        $partnerStats = Order::select('delivery_partner', DB::raw('count(*) as count'))
            ->groupBy('delivery_partner')
            ->get();

        return view('admin.dashboard', [
            'total_users' => $totalUsers,
            'total_orders' => $totalOrders,
            'total_deposits' => $totalDeposits,
            'pending_orders' => $pendingOrders,
            'partner_stats' => $partnerStats
        ]);
    }

    public function approveDeposit(Request $request, $id)
    {
        $deposit = Deposit::findOrFail($id);
        if ($deposit->status === 'pending') {
            DB::transaction(function () use ($deposit) {
                $deposit->update(['status' => 'approved']);
                $deposit->user->increment('wallet_balance', $deposit->amount);
            });
            return back()->with('success', 'Deposit approved');
        }
        return back()->with('error', 'Invalid deposit');
    }

    public function rejectDeposit(Request $request, $id)
    {
        $deposit = Deposit::findOrFail($id);
        $deposit->update(['status' => 'rejected']);
        return back()->with('success', 'Deposit rejected');
    }

    public function addProduct(Request $request)
    {
        $request->validate([
            'title' => 'required|string',
            'short_description' => 'required|string',
            'long_description' => 'required|string',
            'price' => 'required|numeric',
            'stock' => 'required|integer',
            'image' => 'nullable|image|max:2048',
            'category_id' => 'required|exists:categories,id'
        ]);

        $imagePath = $request->file('image') ? $request->file('image')->store('products', 'public') : null;

        Product::create([
            'title' => $request->title,
            'short_description' => $request->short_description,
            'long_description' => $request->long_description,
            'price' => $request->price,
            'stock' => $request->stock,
            'image' => $imagePath,
            'category_id' => $request->category_id
        ]);

        return back()->with('success', 'Product added');
    }

    public function replyTicket(Request $request, $id)
    {
        $request->validate(['reply' => 'required|string']);
        $ticket = Ticket::findOrFail($id);
        $ticket->update([
            'reply' => $request->reply,
            'status' => 'replied'
        ]);
        return back()->with('success', 'Reply sent');
    }
}
