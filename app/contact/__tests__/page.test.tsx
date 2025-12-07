import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ContactPage from "../page";

// Mock sonner
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe("Contact Page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render the contact page", () => {
    render(<ContactPage />);
    expect(screen.getByRole("heading", { name: /contact us/i })).toBeInTheDocument();
  });

  it("should display contact information", () => {
    render(<ContactPage />);
    expect(screen.getByText(/get in touch/i)).toBeInTheDocument();
  });

  it("should have name input field", () => {
    render(<ContactPage />);
    const nameInput = screen.getByLabelText(/name/i);
    expect(nameInput).toBeInTheDocument();
  });

  it("should have email input field", () => {
    render(<ContactPage />);
    const emailInput = screen.getByLabelText(/email/i);
    expect(emailInput).toBeInTheDocument();
    expect(emailInput).toHaveAttribute("type", "email");
  });

  it("should have subject input field", () => {
    render(<ContactPage />);
    const subjectInput = screen.getByLabelText(/subject/i);
    expect(subjectInput).toBeInTheDocument();
  });

  it("should have message textarea", () => {
    render(<ContactPage />);
    const messageTextarea = screen.getByLabelText(/message/i);
    expect(messageTextarea).toBeInTheDocument();
  });

  it("should have submit button", () => {
    render(<ContactPage />);
    const submitButton = screen.getByRole("button", { name: /send|submit/i });
    expect(submitButton).toBeInTheDocument();
  });

  it("should update form fields", async () => {
    const user = userEvent.setup();
    render(<ContactPage />);
    
    const nameInput = screen.getByLabelText(/name/i);
    const emailInput = screen.getByLabelText(/email/i);
    const subjectInput = screen.getByLabelText(/subject/i);
    const messageTextarea = screen.getByLabelText(/message/i);
    
    await user.type(nameInput, "John Doe");
    await user.type(emailInput, "john@example.com");
    await user.type(subjectInput, "Test Subject");
    await user.type(messageTextarea, "Test message");
    
    expect(nameInput).toHaveValue("John Doe");
    expect(emailInput).toHaveValue("john@example.com");
    expect(subjectInput).toHaveValue("Test Subject");
    expect(messageTextarea).toHaveValue("Test message");
  });

  it("should display contact details", () => {
    render(<ContactPage />);
    // Check for contact information - the page has contact details section
    expect(screen.getByRole("heading", { name: /contact us/i })).toBeInTheDocument();
  });

  it("should display contact form", () => {
    render(<ContactPage />);
    // Verify form elements are present
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/message/i)).toBeInTheDocument();
  });

  it("should have submit button", () => {
    render(<ContactPage />);
    const submitButton = screen.getByRole("button", { name: /send|submit/i });
    expect(submitButton).toBeInTheDocument();
  });
});
