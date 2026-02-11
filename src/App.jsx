import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { marked } from 'marked';
import './index.css';

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [fileDropdownOpen, setFileDropdownOpen] = useState(false);
  const [selectedFileText, setSelectedFileText] = useState('All');
  const [conversationId, setConversationId] = useState(null);
  
  const chatEndRef = useRef(null);
  const textareaRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleInputChange = (e) => {
    setInput(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${e.target.scrollHeight}px`;
  };

  const handleCardClick = (text) => {
    setInput(text);
    if (textareaRef.current) {
      textareaRef.current.focus();
      // We need to wait a tick for the value to update before resizing
      setTimeout(() => {
        textareaRef.current.style.height = 'auto';
        textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
      }, 0);
    }
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    try {
      const payload = { question: userMessage.content };
      if (conversationId) {
        payload.conversation_id = conversationId;
      }

      const response = await axios.post(
        'https://bharatai-appengine-caaxhrhbghb2brf3.centralindia-01.azurewebsites.net/ask?customer_id=test_customer_2',
        payload,
        { headers: { 'Content-Type': 'application/json' } }
      );

      // Capture conversation_id if present
      if (response.data && response.data.conversation_id) {
        setConversationId(response.data.conversation_id);
      }

      // Assuming the API returns a JSON with an 'answer' or similar field.
      // If the structure is different, this might need adjustment.
      // Based on common patterns, I'll check for 'answer', 'response', or just stringify if object.
      let assistantContent = "No response content";
      
      if (response.data && typeof response.data === 'string') {
        assistantContent = response.data;
      } else if (response.data && response.data.answer) {
        assistantContent = response.data.answer;
      } else if (response.data && response.data.response) {
        assistantContent = response.data.response;
      } else {
        assistantContent = JSON.stringify(response.data, null, 2);
      }

      const assistantMessage = { role: 'assistant', content: assistantContent };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('API Error:', error);
      const errorMessage = { 
        role: 'assistant', 
        content: `Error: ${error.message}. Please try again.` 
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const toggleFileDropdown = () => {
    setFileDropdownOpen(!fileDropdownOpen);
  };

  const selectStore = (name, displayText) => {
    setSelectedFileText(displayText);
    setFileDropdownOpen(false);
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button className={`mobile-menu-btn ${sidebarOpen ? 'hidden' : ''}`} onClick={toggleSidebar}>
        <i className="fa-solid fa-bars"></i>
      </button>

      {/* Sidebar Overlay */}
      <div className={`sidebar-overlay ${sidebarOpen ? 'active' : ''}`} onClick={toggleSidebar}></div>

      {/* Sidebar */}
      <div className={`sidebar ${sidebarOpen ? 'active' : ''}`}>
        <div className="sidebar-top">
          <button className="icon-btn logo-btn">
            <span style={{ fontWeight: 900, fontSize: '13px', background: 'linear-gradient(to bottom right, #FF9933, #FFFFFF, #138808)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>BAI</span>
          </button>
          <button className="icon-btn"><i className="fa-solid fa-plus"></i></button>
          <div style={{ width: '20px', height: '1px', background: '#e5e7eb', margin: '4px 0' }}></div>
          <button className="icon-btn"><i className="fa-solid fa-magnifying-glass"></i></button>
          <button className="icon-btn active"><i className="fa-solid fa-house"></i></button>
          <button className="icon-btn"><i className="fa-regular fa-folder"></i></button>
          <button className="icon-btn"><i className="fa-solid fa-clock-rotate-left"></i></button>
        </div>
        <div className="sidebar-bottom">
          <button className="icon-btn"><i className="fa-solid fa-gear"></i></button>
          <div className="avatar">
            <span style={{ fontWeight: 900, fontSize: '11px', background: 'linear-gradient(to bottom right, #FF9933, #FFFFFF, #138808)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>VA</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        
        {/* Persistent Header */}
        <div style={{ textAlign: 'center', marginBottom: '20px', flexShrink: 0 }}>
          <div style={{ backgroundColor: '#000', display: 'inline-block', padding: '10px 20px', borderRadius: '12px' }}>
            <h2 id="mainHeading" className="gradient-text" style={{ fontSize: '42px', fontWeight: 800, margin: 0, lineHeight: 1.2, transition: 'fontSize 0.3s ease' }}>BharatAI</h2>
          </div>
        </div>

        {/* Chat History or Initial View */}
        <div className="chat-history" style={{ display: messages.length > 0 ? 'block' : 'none' }}>
          {messages.map((msg, index) => (
            <div key={index} className={`message ${msg.role}`}>
              {msg.role === 'assistant' && (
                <div className="avatar" style={{ width: '28px', height: '28px', minWidth: '28px' }}>
                   <span style={{ fontWeight: 900, fontSize: '10px', background: 'linear-gradient(to bottom right, #FF9933, #FFFFFF, #138808)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>BAI</span>
                </div>
              )}
              <div className="message-content">
                {msg.role === 'assistant' ? (
                  <div className="markdown-body" dangerouslySetInnerHTML={{ __html: marked.parse(msg.content) }} />
                ) : (
                  msg.content
                )}
              </div>
            </div>
          ))}
          {loading && (
             <div className="message assistant">
                <div className="avatar" style={{ width: '28px', height: '28px', minWidth: '28px' }}>
                   <span style={{ fontWeight: 900, fontSize: '10px', background: 'linear-gradient(to bottom right, #FF9933, #FFFFFF, #138808)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>BAI</span>
                </div>
                <div className="message-content">
                    <div className="typing-indicator">
                        <div className="dot"></div>
                        <div className="dot"></div>
                        <div className="dot"></div>
                    </div>
                </div>
             </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {messages.length === 0 && (
            <div id="initialView">
                <div className="greeting-container">
                    <h1 className="greeting-title" style={{ color: '#000' }}>
                        Hey Vamika 👋 What can I help with?
                    </h1>
                </div>

                <div className="cards-grid">
                     <div className="prompt-card" onClick={() => handleCardClick("Help me draft a response to a difficult client email")}>
                        <div className="card-icon"><i className="fa-regular fa-envelope"></i></div>
                        <div className="card-text">Help me draft a response to a difficult client email</div>
                    </div>
                    <div className="prompt-card" onClick={() => handleCardClick("Create a launch plan for our new feature")}>
                        <div className="card-icon"><i className="fa-solid fa-rocket"></i></div>
                        <div className="card-text">Create a launch plan for our new feature</div>
                    </div>
                    <div className="prompt-card" onClick={() => handleCardClick("Analyze this quarterly report data")}>
                        <div className="card-icon"><i className="fa-solid fa-chart-pie"></i></div>
                        <div className="card-text">Analyze this quarterly report data</div>
                    </div>
                    <div className="prompt-card" onClick={() => handleCardClick("Write a blog post about AI trends")}>
                        <div className="card-icon"><i className="fa-solid fa-pen-nib"></i></div>
                        <div className="card-text">Write a blog post about AI trends</div>
                    </div>
                </div>
            </div>
        )}

        {/* Chat Input */}
        <div className="chat-container">
          <div className="input-wrapper">
            <div className="input-top">
              <textarea 
                ref={textareaRef}
                className="chat-input" 
                placeholder="Message BharatAI" 
                rows="1"
                value={input}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
              ></textarea>
              <div style={{ position: 'relative' }}>
                <button className="web-btn" onClick={toggleFileDropdown}>
                  <i className="fa-solid fa-globe"></i> <span id="selectedFileText">{selectedFileText}</span> <i className="fa-solid fa-chevron-down" style={{ fontSize: '10px', marginLeft: '4px' }}></i>
                </button>
                <div className={`dropdown-menu ${fileDropdownOpen ? 'show' : ''}`}>
                  <div className={`dropdown-item ${selectedFileText === 'All' ? 'active' : ''}`} onClick={() => selectStore('all', 'All')}>All</div>
                  {/* Mock stores for now as per original UI logic which loaded from backend */}
                </div>
              </div>
            </div>
            <div className="input-bottom">
              <div className="input-actions">
                <button className="action-btn">
                  <i className="fa-solid fa-paperclip"></i> <span>Upload Attachment</span>
                </button>
              </div>
              <button 
                className="send-btn" 
                onClick={sendMessage}
                disabled={loading || !input.trim()}
              >
                <i className="fa-solid fa-paper-plane"></i>
              </button>
            </div>
          </div>
          <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '8px', marginLeft: '16px' }}></div>
        </div>
      </div>
    </>
  );
}

export default App;
