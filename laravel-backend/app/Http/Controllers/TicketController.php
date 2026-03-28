<?php

namespace App\Http\Controllers;

use App\Models\Ticket;
use Illuminate\Http\Request;

class TicketController extends Controller
{
    public function index(Request $request)
    {
        return Ticket::where('user_id', $request->user()->id)->get();
    }

    public function allTickets()
    {
        return Ticket::with('user')->get();
    }

    public function store(Request $request)
    {
        $request->validate([
            'category' => 'required',
            'message' => 'required'
        ]);

        $ticket = Ticket::create([
            'user_id' => $request->user()->id,
            'category' => $request->category,
            'message' => $request->message,
            'status' => 'open'
        ]);

        return response()->json($ticket, 201);
    }

    public function reply(Request $request, $id)
    {
        $request->validate(['reply' => 'required']);
        $ticket = Ticket::findOrFail($id);
        $ticket->update([
            'reply' => $request->reply,
            'status' => 'replied'
        ]);
        return response()->json($ticket);
    }
}
