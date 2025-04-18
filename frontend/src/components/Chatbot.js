import { useState, useEffect, useRef } from "react";
import {
  FiMessageSquare,
  FiX,
  FiSend,
  FiChevronRight,
  FiArrowLeft,
  FiClock,
  FiTrash2,
  FiSearch,
  FiAlertCircle,
} from "react-icons/fi";
import {
  getChatbotResponse,
  getWelcomeMessage,
  quickReplies,
  saveConversation,
  loadConversations,
} from "../services/chatbotService";
import {
  submitIssue,
  getUserIssuesByEmail,
  updateIssueStatus,
} from "../services/issueService";
import IssueForm from "./IssueForm";

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const [currentView, setCurrentView] = useState("welcome"); // welcome, questions, conversation, history, issue
  const [conversations, setConversations] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredQuestions, setFilteredQuestions] = useState([]);
  const [showIssueForm, setShowIssueForm] = useState(false);
  const [submittedIssues, setSubmittedIssues] = useState([]);
  const [isLoadingIssues, setIsLoadingIssues] = useState(false);
  const [issueError, setIssueError] = useState("");

  // Add a ref for the chat container
  const chatContainerRef = useRef(null);

  // Auto-scroll to bottom when messages or submittedIssues change
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [messages, submittedIssues]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Load conversations from local storage
  useEffect(() => {
    if (isOpen) {
      const savedConversations = loadConversations();
      setConversations(savedConversations);
    }
  }, [isOpen]);

  // Add welcome message when chat is opened
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          id: 1,
          text: getWelcomeMessage(),
          sender: "bot",
        },
      ]);
      setCurrentView("welcome");
    }
  }, [isOpen]);

  // Filter questions based on search term
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredQuestions(quickReplies);
    } else {
      const filtered = quickReplies.filter(
        (reply) =>
          reply.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
          reply.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredQuestions(filtered);
    }
  }, [searchTerm]);

  // Fetch issues from the database when the component mounts
  useEffect(() => {
    const fetchIssues = async () => {
      try {
        const issues = await getUserIssuesByEmail();
        setSubmittedIssues(Array.isArray(issues) ? issues : []);
      } catch (error) {
        console.error("Error fetching issues:", error);
        setIssueError("Failed to fetch issues. Please try again.");
      }
    };

    fetchIssues();
  }, []);

  const handleQuickReplyClick = (question, answer) => {
    // Add user question to messages
    setMessages((prev) => [
      ...prev,
      {
        id: prev.length + 1,
        text: question,
        sender: "user",
      },
    ]);

    // Show typing indicator
    setIsTyping(true);
    setCurrentView("conversation");

    // Simulate bot typing delay
    setTimeout(() => {
      // Add bot answer to messages
      setMessages((prev) => [
        ...prev,
        {
          id: prev.length + 1,
          text: answer,
          sender: "bot",
        },
      ]);
      setIsTyping(false);
    }, 1000);
  };

  const handleSendMessage = async () => {
    if (inputMessage.trim() === "") return;

    // Add user message to messages
    setMessages((prev) => [
      ...prev,
      {
        id: prev.length + 1,
        text: inputMessage,
        sender: "user",
      },
    ]);

    // Clear input
    setInputMessage("");
    setCurrentView("conversation");

    // Show typing indicator
    setIsTyping(true);

    try {
      // Get response from chatbot service
      const botResponse = await getChatbotResponse(inputMessage);

      // Add bot response to messages
      setMessages((prev) => [
        ...prev,
        {
          id: prev.length + 1,
          text: botResponse,
          sender: "bot",
        },
      ]);
    } catch (error) {
      console.error("Error getting chatbot response:", error);

      // Add error message
      setMessages((prev) => [
        ...prev,
        {
          id: prev.length + 1,
          text: "Sorry, I'm having trouble responding right now. Please try again later or contact our support at +91 7383367738.",
          sender: "bot",
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  const handleBackToQuestions = () => {
    setCurrentView("questions");
  };

  const handleViewAllQuestions = () => {
    setCurrentView("questions");
  };

  const handleStartNewConversation = () => {
    setMessages([
      {
        id: 1,
        text: getWelcomeMessage(),
        sender: "bot",
      },
    ]);
    setCurrentView("welcome");
  };

  const handleViewHistory = () => {
    setCurrentView("history");
  };

  const handleLoadConversation = (conversation) => {
    setMessages(conversation.messages);
    setCurrentView("conversation");
  };

  const handleDeleteConversation = (id) => {
    const updatedConversations = conversations.filter((conv) => conv.id !== id);
    setConversations(updatedConversations);
    localStorage.setItem(
      "chatbotConversations",
      JSON.stringify(updatedConversations)
    );
  };

  const handleSaveConversation = () => {
    if (messages.length > 1) {
      saveConversation(messages);
      const savedConversations = loadConversations();
      setConversations(savedConversations);
    }
  };

  const handleOpenIssueForm = () => {
    setShowIssueForm(true);
  };

  const handleCloseIssueForm = () => {
    setShowIssueForm(false);
  };

  const handleSubmitIssue = async (issueData) => {
    try {
      setIsLoadingIssues(true);
      setIssueError("");

      // Prepare the data to be sent to the backend
      const dataToSend = {
        ...issueData,
        status: "pending",
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
        expectedResolutionDate: new Date(
          Date.now() + 5 * 24 * 60 * 60 * 1000
        ).toISOString(),
        priority: issueData.priority || "medium",
        // TODO: Verify 'support' is a valid enum value in the backend Issue schema for issueType
        issueType: issueData.issueType || "support",
        petCategory: issueData.petCategory || "Not specified",
        petName: issueData.petName || "Not specified",
        name: issueData.name || "Not provided",
        email: issueData.email || "Not provided",
        phone: issueData.phone || "Not provided",
        description: issueData.description || "No description provided",
      };

      // Submit the issue
      const response = await submitIssue(dataToSend);

      if (!response || !response._id) {
        console.error(
          "Backend did not return a valid issue object with _id:",
          response
        );
        throw new Error(
          "Failed to save issue properly on the server. Check backend logs for validation errors."
        );
      }

      // Construct the object to add to the state
      // Use the submitted data and merge the response (e.g., _id from backend)
      const issueToAdd = {
        ...dataToSend, // Start with the data we sent
        ...response, // Override with backend response (like _id, potentially updated status)
        // Ensure critical fields for display are definitely present using the response ID
        _id: response._id, // Use the confirmed backend ID
        status: response.status || dataToSend.status,
        createdAt: response.createdAt || dataToSend.createdAt,
        name: dataToSend.name,
        email: dataToSend.email,
        phone: dataToSend.phone,
        description: dataToSend.description,
        issueType: dataToSend.issueType,
        petCategory: dataToSend.petCategory,
        petName: dataToSend.petName,
      };

      // Add the fully constructed issue object to the state
      setSubmittedIssues((prevIssues) => {
        const currentIssues = Array.isArray(prevIssues) ? prevIssues : [];
        return [issueToAdd, ...currentIssues];
      });

      // Show the history section after submission
      setCurrentView("history");
      setShowIssueForm(false);
    } catch (error) {
      console.error("Error submitting issue:", error);
      setIssueError(
        error.message || "Failed to submit issue. Please try again."
      );
    } finally {
      setIsLoadingIssues(false);
    }
  };

  const handleCancelIssue = async (issueId) => {
    try {
      setIsLoadingIssues(true);
      // Call the service to update the issue status
      await updateIssueStatus(issueId, "cancelled");

      // Update the issue in the local state
      setSubmittedIssues((prevIssues) =>
        prevIssues.map((issue) =>
          issue._id === issueId ? { ...issue, status: "cancelled" } : issue
        )
      );
    } catch (error) {
      console.error("Error cancelling issue:", error);
      setIssueError("Failed to cancel issue. Please try again.");
    } finally {
      setIsLoadingIssues(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Chat button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-indigo-600 text-white rounded-full p-4 shadow-lg hover:bg-indigo-700 transition-all duration-300 transform hover:scale-110"
          aria-label="Open chat"
        >
          <FiMessageSquare className="w-6 h-6" />
        </button>
      )}

      {/* Chat window */}
      {isOpen && (
        <div className="bg-white rounded-lg shadow-xl w-80 md:w-96 h-[600px] flex flex-col overflow-hidden">
          {/* Chat header */}
          <div className="bg-indigo-600 text-white p-4 flex justify-between items-center">
            <div className="flex items-center">
              {currentView !== "welcome" && (
                <button
                  onClick={
                    currentView === "conversation"
                      ? handleBackToQuestions
                      : currentView === "history"
                      ? handleStartNewConversation
                      : handleStartNewConversation
                  }
                  className="mr-2 text-white hover:text-gray-200"
                  aria-label="Go back"
                >
                  <FiArrowLeft className="w-5 h-5" />
                </button>
              )}
              <h3 className="font-semibold">Pet Assistant</h3>
            </div>
            <div className="flex items-center">
              {currentView === "conversation" && (
                <button
                  onClick={handleSaveConversation}
                  className="mr-2 text-white hover:text-gray-200"
                  aria-label="Save conversation"
                  title="Save conversation"
                >
                  <FiClock className="w-5 h-5" />
                </button>
              )}
              {currentView === "welcome" && (
                <>
                  <button
                    onClick={handleViewHistory}
                    className="mr-2 text-white hover:text-gray-200"
                    aria-label="View history"
                    title="View conversation history"
                  >
                    <FiClock className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handleOpenIssueForm}
                    className="mr-2 text-white hover:text-gray-200"
                    aria-label="Raise an issue"
                    title="Raise an issue"
                  >
                    <FiAlertCircle className="w-5 h-5" />
                  </button>
                </>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="text-white hover:text-gray-200"
                aria-label="Close chat"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Issue Form Modal */}
          {showIssueForm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="w-full max-w-md">
                <IssueForm
                  onSubmit={handleSubmitIssue}
                  onClose={handleCloseIssueForm}
                />
              </div>
            </div>
          )}

          {/* Chat messages container with scrolling */}
          <div
            ref={chatContainerRef}
            className="flex-1 overflow-y-auto p-4 space-y-4"
            style={{
              maxHeight: "calc(100% - 120px)",
              scrollBehavior: "smooth",
              position: "relative",
            }}
          >
            {currentView === "history" ? (
              <div className="space-y-4">
                <h4 className="font-medium text-gray-700">Issue History</h4>
                {isLoadingIssues ? (
                  <div className="flex justify-center items-center h-32">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                  </div>
                ) : issueError ? (
                  <div className="bg-red-100 text-red-700 p-3 rounded-lg text-sm">
                    {issueError}
                  </div>
                ) : submittedIssues.length === 0 ? (
                  <p className="text-gray-500 text-sm">
                    You haven't submitted any issues yet.
                  </p>
                ) : (
                  submittedIssues.map((issue) => (
                    <div
                      key={issue?._id || Math.random()}
                      className="bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition-colors duration-200"
                    >
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs text-gray-500">
                          Created:{" "}
                          {issue?.createdAt
                            ? new Date(issue.createdAt).toLocaleDateString()
                            : "N/A"}
                        </span>
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            issue?.status === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : issue?.status === "in-progress"
                              ? "bg-blue-100 text-blue-800"
                              : issue?.status === "resolved"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {issue?.status
                            ? issue.status.charAt(0).toUpperCase() +
                              issue.status.slice(1)
                            : "Unknown"}
                        </span>
                      </div>

                      <div className="mb-2">
                        <p className="text-sm font-medium text-gray-800">
                          {issue?.issueType
                            ? issue.issueType.charAt(0).toUpperCase() +
                              issue.issueType.slice(1)
                            : "General Issue"}
                        </p>
                        <p className="text-xs text-gray-600 mt-1">
                          {issue?.description || "No description provided"}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
                        <div>
                          <p className="font-medium">Contact Info:</p>
                          <p>Name: {issue?.name || "Not provided"}</p>
                          <p>Email: {issue?.email || "Not provided"}</p>
                          <p>Phone: {issue?.phone || "Not provided"}</p>
                        </div>
                        <div>
                          <p className="font-medium">Pet Details:</p>
                          <p>
                            Category: {issue?.petCategory || "Not specified"}
                          </p>
                          <p>Name: {issue?.petName || "Not specified"}</p>
                        </div>
                      </div>

                      {(issue?.status === "pending" ||
                        issue?.status === "in-progress") && (
                        <button
                          onClick={() => handleCancelIssue(issue._id)}
                          className="mt-3 w-full text-sm bg-red-100 hover:bg-red-200 text-red-800 py-1 px-3 rounded transition-colors duration-200"
                          disabled={isLoadingIssues}
                        >
                          Cancel Issue
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            ) : currentView === "questions" ? (
              <div className="space-y-4">
                {/* Search bar */}
                <div className="relative">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search questions..."
                    className="w-full p-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <FiSearch className="absolute left-3 top-3 text-gray-400" />
                </div>

                {/* Questions list */}
                <div className="space-y-2">
                  {filteredQuestions.map((reply) => (
                    <button
                      key={reply.id}
                      onClick={() =>
                        handleQuickReplyClick(reply.question, reply.answer)
                      }
                      className="w-full text-left bg-gray-50 hover:bg-gray-100 text-gray-800 rounded-lg p-3 transition-colors duration-200"
                    >
                      {reply.question}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <>
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.sender === "user"
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg p-3 ${
                        message.sender === "user"
                          ? "bg-indigo-600 text-white"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {message.text}
                    </div>
                  </div>
                ))}

                {/* Typing indicator */}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 text-gray-800 rounded-lg p-3">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div
                          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: "0.2s" }}
                        ></div>
                        <div
                          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: "0.4s" }}
                        ></div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Back to Questions button - only show after answer is displayed */}
                {!isTyping && messages.length > 1 && (
                  <div className="flex justify-center mt-4">
                    <button
                      onClick={handleBackToQuestions}
                      className="bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg px-4 py-2 flex items-center transition-colors duration-200"
                    >
                      <FiArrowLeft className="mr-2" />
                      Back to Questions
                    </button>
                  </div>
                )}

                {/* Quick replies */}
                <div className="space-y-2 mt-4">
                  <button
                    onClick={handleViewAllQuestions}
                    className="w-full bg-indigo-100 hover:bg-indigo-200 text-indigo-800 rounded-lg p-3 text-center font-medium transition-colors duration-200"
                  >
                    View All Common Questions
                  </button>
                  <button
                    onClick={handleOpenIssueForm}
                    className="w-full bg-red-100 hover:bg-red-200 text-red-800 rounded-lg p-3 text-center font-medium transition-colors duration-200"
                  >
                    Raise an Issue
                  </button>
                </div>
              </>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Chat input */}
          {currentView !== "history" && (
            <div className="border-t p-4">
              <div className="flex items-center">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  className="flex-1 border rounded-l-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-black placeholder-gray-500"
                />
                <button
                  onClick={handleSendMessage}
                  className="bg-indigo-600 text-white rounded-r-lg px-4 py-2 hover:bg-indigo-700 transition-colors duration-200"
                  aria-label="Send message"
                >
                  <FiSend className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Chatbot;
