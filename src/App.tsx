import React, { useState } from "react";
import { Container, Row, Col, Form, Button, InputGroup } from "react-bootstrap";
import Spinner from "react-bootstrap/Spinner";

const App = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [messages, setMessages] = useState<
    { text: string; type: string }[] | []
  >([]);
  const [inputText, setInputText] = useState("");

  const handleMessageSubmit = async (e: any) => {
    try {
      e.preventDefault();
      if (inputText.trim() === "") return;
      setMessages((preVal: { text: string; type: string }[] | []) => {
        return [...preVal, { text: inputText.trim(), type: "self" }];
      });
      setInputText("");
      setLoading(true);

      const res = await (
        await fetch("http://127.0.0.1:8000/api/v1/chat/start-conversation", {
          method: "POST",
          body: JSON.stringify({
            guest_id: "777",
            chat_id: "888",
            msg: inputText.trim(),
          }),
          headers: {
            "Content-Type": "application/json",
          },
        })
      ).json();
      setLoading(false);
      setMessages((preVal: { text: string; type: string }[] | []) => {
        return [...preVal, { text: res.message, type: "ai" }];
      });
    } catch (err) {
      setLoading(false);
    }
  };

  return (
    <Container className="mycontainer">
      <Row className="w-100">
        <Col>
          <div className="chat-window">
            {messages.map((message, index) => (
              <React.Fragment key={index}>
              <div
                className={
                  message.type === "self" ? "user-message" : "bot-message"
                }
                style={{whiteSpace:"pre-wrap"}}
                >
                {message.text}
              </div>
              <br />
              </React.Fragment>
            ))}
          </div>
          <Form onSubmit={handleMessageSubmit} className="mt-3">
            <InputGroup className="mb-3">
              <Form.Control
                type="text"
                placeholder="Type your message..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
              />
              <Button variant="primary" type="submit">
                Send
              </Button>
            </InputGroup>
          </Form>
        </Col>
      </Row>
      {loading ? (
        <div className="loader">
          <Spinner animation="border" role="status" variant="light">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </div>
      ) : null}
    </Container>
  );
};

export default App;
