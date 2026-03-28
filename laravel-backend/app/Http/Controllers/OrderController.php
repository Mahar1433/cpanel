<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use App\Models\Deposit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class OrderController extends Controller
{
    public function index(Request $request)
    {
        return Order::where('user_id', $request->user()->id)->with('product')->get();
    }

    public function allOrders()
    {
        return Order::with(['user', 'product'])->get();
    }

    public function store(Request $request)
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'quantity' => 'required|integer|min:1',
            'delivery_partner' => 'required',
            'shipping_label' => 'required|file|mimes:pdf,jpg,png,jpeg|max:2048'
        ]);

        $product = Product::find($request->product_id);
        $totalPrice = $product->price * $request->quantity;
        $user = $request->user();

        if ($user->wallet_balance < $totalPrice) {
            return response()->json(['error' => 'Insufficient wallet balance'], 400);
        }

        if ($product->stock < $request->quantity) {
            return response()->json(['error' => 'Insufficient product stock'], 400);
        }

        return DB::transaction(function () use ($request, $product, $totalPrice, $user) {
            $path = $request->file('shipping_label')->store('labels', 'public');
            
            $order = Order::create([
                'user_id' => $user->id,
                'product_id' => $product->id,
                'quantity' => $request->quantity,
                'total_price' => $totalPrice,
                'delivery_partner' => $request->delivery_partner,
                'shipping_label' => Storage::url($path),
                'status' => 'pending'
            ]);

            $user->decrement('wallet_balance', $totalPrice);
            $product->decrement('stock', $request->quantity);

            return response()->json($order, 201);
        });
    }

    public function stats()
    {
        return response()->json([
            'totalUsers' => User::where('role', 'seller')->count(),
            'totalOrders' => Order::count(),
            'totalDeposits' => Deposit::where('status', 'approved')->sum('amount'),
            'pendingOrders' => Order::where('status', 'pending')->count(),
            'partnerStats' => Order::select('delivery_partner', DB::raw('count(*) as count'))
                ->groupBy('delivery_partner')
                ->get()
        ]);
    }
}
