# Think Connect 🧠✨

Think Connect is an AI-powered interactive therapeutic assistant designed to provide an empathetic and understanding space for users to explore their thoughts. It's a full-stack web application featuring a multi-stage AI pipeline that listens, understands, and interacts in a deeply personalized and conversational manner.

# 🏛️ High-Level Architecture

The application operates on a client-server model, with a dynamic web interface communicating with a unified Python backend that houses the entire AI pipeline.

# 🌊 Data Flow Diagram

The core logic resides within the FastAPI server. Here is a detailed breakdown of how data flows through the AI services during a user session.

# ✨ Key Features
- End-to-End AI Pipeline: A complete system processing raw audio through transcription, emotion analysis, and context-aware response generation.

- Intelligent RAG System: Utilizes Retrieval-Augmented Generation with a ChromaDB vector database to ground the LLM's responses in a specialized knowledge base, ensuring accuracy and relevance.

- Dynamic Conversational AI: Engages users in an interactive dialogue by generating clarifying questions based on their initial statement and emotional state.

- Nuanced Emotion Analysis: A custom BiLSTM model identifies both primary and secondary emotions for a deeper understanding of the user's state.

- Interactive Web Interface: A modern, responsive frontend built with HTML, Tailwind CSS, and JavaScript, featuring real-time audio visualization and dynamic state management.

- Downloadable Summaries: Users can download a complete summary of their session, including their responses and the AI's analysis, as a formatted PDF.

- Extensible Knowledge Base: Includes a utility script (ingest_document.py) to automatically process and add new knowledge from PDF documents into the vector database.

