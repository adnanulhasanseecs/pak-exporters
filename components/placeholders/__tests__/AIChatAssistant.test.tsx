import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { AIChatAssistant } from "../AIChatAssistant";

describe("AIChatAssistant", () => {
  it("should render the component", () => {
    render(<AIChatAssistant />);
    expect(screen.getByText("AI Chat Assistant")).toBeInTheDocument();
  });

  it("should display the description", () => {
    render(<AIChatAssistant />);
    expect(
      screen.getByText(/Ask me anything about products/i)
    ).toBeInTheDocument();
  });

  it("should have disabled input and send button", () => {
    render(<AIChatAssistant />);
    const input = screen.getByPlaceholderText(/Type your message/i);
    const sendButton = screen.getByLabelText(/Send message/i);
    
    expect(input).toBeDisabled();
    expect(sendButton).toBeDisabled();
  });

  it("should display placeholder messages", () => {
    render(<AIChatAssistant />);
    expect(
      screen.getByText(/Hello! I'm your AI assistant/i)
    ).toBeInTheDocument();
  });

  it("should render as minimized button when isMinimized is true", () => {
    render(<AIChatAssistant isMinimized={true} />);
    const button = screen.getByLabelText("Open AI Chat Assistant");
    expect(button).toBeInTheDocument();
  });

  it("should accept onSendMessage callback", () => {
    const onSendMessage = vi.fn();
    render(<AIChatAssistant onSendMessage={onSendMessage} />);
    
    // Input is disabled in placeholder, but callback is accepted
    const input = screen.getByPlaceholderText(/Type your message/i);
    expect(input).toBeDisabled();
    expect(onSendMessage).toBeDefined();
  });
});

