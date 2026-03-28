<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Product;
use App\Models\Deposit;
use App\Models\Ticket;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class SellerController extends Controller
{
    public function dashboard()
    {
        $user = Auth::user();
        $orders = Order::where('user_id', $user->id)->get();
        $deposits = Deposit::where('user_id', $user->id)->get();

        return view('seller.dashboard', [
            'total_orders' => $orders->count(),
            'pending_orders' => $orders->where('status', 'pending')->count(),
            'wallet_balance' => $user->wallet_balance,
            'store_name' => $user->store_name,
            'recent_orders' => $orders->sortByDesc('created_at')->take(5)
        ]);
    }

    public function placeOrder(Request $request)
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'quantity' => 'required|integer|min:1',
            'delivery_partner' => 'required|string',
            'shipping_label' => 'required|file|mimes:pdf,jpg,png|max:2048'
        ]);

        $product = Product::findOrFail($request->product_id);
        $user = Auth::user();
        $total_price = $product->price * $request->quantity;

        if ($user->wallet_balance < $total_price) {
            return back()->with('error', 'Insufficient wallet balance');
        }

        if ($product->stock < $request->quantity) {
            return back()->with('error', 'Insufficient stock');
        }

        DB::transaction(function () use ($request, $user, $product, $total_price) {
            $labelPath = $request->file('shipping_label')->store('labels', 'public');

            Order::create([
                'user_id' => $user->id,
                'product_id' => $product->id,
                'quantity' => $request->quantity,
                'total_price' => $total_price,
                'shipping_label' => $labelPath,
                'delivery_partner' => $request->delivery_partner,
                'status' => 'pending'
            ]);

            $user->decrement('wallet_balance', $total_price);
            $product->decrement('stock', $request->quantity);
        });

        return redirect()->route('seller.orders')->with('success', 'Order placed successfully');
    }

    public function deposit(Request $request)
    {
        $request->validate([
            'amount' => 'required|numeric|min:1',
            'payment_method' => 'required|string',
            'screenshot' => 'required|image|max:2048'
        ]);

        $screenshotPath = $request->file('screenshot')->store('deposits', 'public');

        Deposit::create([
            'user_id' => Auth::id(),
            'amount' => $request->amount,
            'payment_method' => $request->payment_method,
            'screenshot' => $screenshotPath,
            'status' => 'pending'
        ]);

        return back()->with('success', 'Deposit request submitted');
    }

    public function createTicket(Request $request)
    {
        $request->validate([
            'category' => 'required|string',
            'message' => 'required|string'
        ]);

        Ticket::create([
            'user_id' => Auth::id(),
            'category' => $request->category,
            'message' => $request->message,
            'status' => 'open'
        ]);

        return back()->with('success', 'Ticket created');
    }
}
