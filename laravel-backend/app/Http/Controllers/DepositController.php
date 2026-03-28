<?php

namespace App\Http\Controllers;

use App\Models\Deposit;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class DepositController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'amount' => 'required|numeric|min:1',
            'payment_method' => 'required',
            'screenshot' => 'required|image|max:2048'
        ]);

        $path = $request->file('screenshot')->store('deposits', 'public');

        $deposit = Deposit::create([
            'user_id' => $request->user()->id,
            'amount' => $request->amount,
            'payment_method' => $request->payment_method,
            'screenshot' => Storage::url($path),
            'status' => 'pending'
        ]);

        return response()->json($deposit, 201);
    }

    public function allDeposits()
    {
        return Deposit::with('user')->get();
    }

    public function approve($id)
    {
        $deposit = Deposit::findOrFail($id);
        if ($deposit->status !== 'pending') {
            return response()->json(['error' => 'Deposit already processed'], 400);
        }

        DB::transaction(function () use ($deposit) {
            $deposit->update(['status' => 'approved']);
            $deposit->user->increment('wallet_balance', $deposit->amount);
        });

        return response()->json(['message' => 'Deposit approved']);
    }

    public function reject($id)
    {
        $deposit = Deposit::findOrFail($id);
        $deposit->update(['status' => 'rejected']);
        return response()->json(['message' => 'Deposit rejected']);
    }
}
