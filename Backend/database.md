Database Schema Documentation
Overview
This document outlines the schema for a database supporting a chat application with message history and graph-related data. The schema consists of three main tables: Chat, messages, and graphs, all linked to a central auth.users table.

Tables
Chat
This table stores information about each chat session.

|

| Column | Data Type | Description |
| c_id | uuid | Primary key, unique identifier for the chat. |
| user_id | uuid | The user who owns the chat. Foreign key referencing auth.users.id. |
| created_at | timestamptz | The timestamp when the chat was created. |
| name | text | A user-friendly name for the chat. |
| userid | text | A textual representation of the user's ID. |

messages
This table stores the history of messages within a chat session.

| Column | Data Type | Description |
| id | int8 | Primary key, unique identifier for the message. |
| created_at | timestamptz | The timestamp when the message was created. |
| user_message | varchar | The message sent by the user. |
| response | jsonb | The JSON-formatted response from the application. |
| c_id | text | Foreign key referencing the Chat table, linking the message to a specific chat session. |
| user_id | text | The user who sent the message. |

graphs
This table stores data related to any graphs or visualizations generated within a chat.

| Column | Data Type | Description |
| id | int8 | Primary key, unique identifier for the graph data. |
| created_at | timestamptz | The timestamp when the graph data was created. |
| chat_id | text | Foreign key referencing the Chat table, linking the graph to a specific chat. |
| graph_data | jsonb | The JSON-formatted data for the graph. |
| userid | text | The user who created the graph. |
| name | text | A name for the graph. |

Relationships
Chat to auth.users: A one-to-many relationship where a single user can have multiple chat sessions.

messages to Chat: A one-to-many relationship where one chat session can contain multiple messages.

graphs to Chat: A one-to-many relationship where one chat session can contain multiple generated graphs.