# Think Connect 🧠✨

Think Connect is an AI-powered interactive therapeutic assistant designed to provide an empathetic and understanding space for users to explore their thoughts. It's a full-stack web application featuring a multi-stage AI pipeline that listens, understands, and interacts in a deeply personalized and conversational manner.

# 🏛️ High-Level Architecture

The application operates on a client-server model, with a dynamic web interface communicating with a unified Python backend that houses the entire AI pipeline.

graph TD
    A[User's Browser <br> (index.html)] -- 1. Records Audio --> B{FastAPI Server <br> (main_app.py)};
    B -- 2. Transcribes & Analyzes --> C[AI Pipeline];
    C -- 3. Generates Questions --> B;
    B -- 4. Sends Questions --> A;
    A -- 5. User Answers Questions --> B;
    B -- 6. Generates Summary --> C;
    C -- 7. Provides Final Text --> B;
    B -- 8. Sends Summary --> A;
    A -- 9. Displays Summary & PDF Option --> A;

    subgraph C [AI Pipeline Services]
        C1[Whisper <br> Speech-to-Text]
        C2[BiLSTM Model <br> Emotion Classification]
        C3[RAG System <br> (SentenceTransformer + ChromaDB)]
        C4[Gemini Pro <br> LLM Generation]
    end

    style C fill:#262626,stroke:#8b5cf6,stroke-width:2px
