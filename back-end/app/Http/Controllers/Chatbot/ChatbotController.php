<?php

namespace App\Http\Controllers\Chatbot;

use App\Http\Controllers\Controller;
use App\Http\Requests\Chatbot\SendChatMessageRequest;
use App\Http\Resources\ChatbotConversationResource;
use App\Models\ChatbotConversation;
use App\Models\ChatbotMessage;
use App\Services\ChatbotService;
use Illuminate\Http\Request;

class ChatbotController extends Controller
{
    public function __construct(protected ChatbotService $bot)
    {
    }

    public function index(Request $request)
    {
        $conversations = ChatbotConversation::where('user_id', $request->user()->id)
            ->with('messages')
            ->latest()
            ->paginate(10);

        return ChatbotConversationResource::collection($conversations);
    }

    public function show(Request $request, ChatbotConversation $conversation)
    {
        $this->authorizeOwner($request, $conversation);

        return ChatbotConversationResource::make($conversation->load('messages'));
    }


    public function store(SendChatMessageRequest $request)
    {
        $conversation = ChatbotConversation::create(['user_id' => $request->user()->id]);

        $this->recordExchange($conversation, $request->validated('message'));

        return ChatbotConversationResource::make($conversation->fresh()->load('messages'))
            ->response()
            ->setStatusCode(201);
    }

    public function sendMessage(SendChatMessageRequest $request, ChatbotConversation $conversation)
    {
        $this->authorizeOwner($request, $conversation);

        $this->recordExchange($conversation, $request->validated('message'));

        return ChatbotConversationResource::make($conversation->fresh()->load('messages'));
    }

    protected function recordExchange(ChatbotConversation $conversation, string $userMessage): void
    {
        ChatbotMessage::create([
            'conversation_id' => $conversation->id,
            'sender' => 'user',
            'message' => $userMessage,
            'created_at' => now(),
        ]);

        $reply = $this->bot->respond($userMessage);

        ChatbotMessage::create([
            'conversation_id' => $conversation->id,
            'sender' => 'bot',
            'message' => $reply['answer'],
            'created_at' => now(),
        ]);
    }

    protected function authorizeOwner(Request $request, ChatbotConversation $conversation): void
    {
        abort_unless($conversation->user_id === $request->user()->id, 403, 'Not your conversation.');
    }
}
