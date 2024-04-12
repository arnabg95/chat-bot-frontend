import { useState } from "react";
import { Container, Row, Col, Form, Button } from "react-bootstrap";

const App = () => {
  const [messages, setMessages] = useState<
    { text: string; type: string }[] | []
  >([]);
  const [inputText, setInputText] = useState("");

  const handleMessageSubmit = async (e: any) => {
    e.preventDefault();
    if (inputText.trim() === "") return;
    setMessages((preVal: { text: string; type: string }[] | []) => {
      return [...preVal, { text: inputText.trim(), type: "self" }];
    });
    setInputText("");
    const res = await (
      await fetch("http://127.0.0.1:8000/api/v1/chat/start-conversation", {
        method: "POST",
        body: JSON.stringify({ guest_id: "8968", chat_id: "5656", msg: inputText.trim() }),
        headers: {
          'Content-Type': 'application/json'
        },
      })
    ).json();
    setMessages((preVal: { text: string; type: string }[] | []) => {
      return [...preVal, { text: res.message, type: "ai" }];
    });
  };

  return (
    <Container>
      <Row>
        <Col>
          <div className="chat-window">
            {messages.map((message, index) => (
              <div
                key={index}
                className={
                  message.type === "self" ? "user-message" : "bot-message"
                }
              >
                {message.text}
              </div>
            ))}
          </div>
          <Form onSubmit={handleMessageSubmit} className="mt-3">
            <Form.Group>
              <Form.Control
                type="text"
                placeholder="Type your message..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
              />
            </Form.Group>
            <Button variant="primary" type="submit">
              Send
            </Button>
          </Form>
        </Col>
      </Row>
    </Container>
  );
};

export default App;
