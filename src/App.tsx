import { useState, useRef, useEffect } from "react";
import { Container, Row, Col, Form, InputGroup } from "react-bootstrap";
import Spinner from "react-bootstrap/Spinner";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPaperPlane } from "@fortawesome/free-regular-svg-icons";
import { v4 as uuidv4 } from "uuid";
import { faCirclePlus } from "@fortawesome/free-solid-svg-icons";


const App = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [guestId, setGuestId] = useState<string | null>(null);
  const [chatId, setchatId] = useState<string | null>(null);
  const [chatIds, setchatIds] = useState<string[] | null>(null);
  const [messages, setMessages] = useState<
    { text: string; type: string }[] | []
  >([]);
  const [inputText, setInputText] = useState("");

  const lastMsg = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    if (lastMsg.current) {
      lastMsg.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const guestId = localStorage.getItem("guest");
    if (!guestId) {
      const id = uuidv4();
      localStorage.setItem("guest", JSON.stringify(id));
      setGuestId(id);
    } else {
      setGuestId(guestId);
    }
  }, []);

  useEffect(() => {
    if (guestId) {
      async function getChatIDs() {
        const res = await (
          await fetch(
            "http://127.0.0.1:8000/api/v1/chat/get-chat-id-list/" + guestId
          )
        ).json();
        setchatIds(res.chatIds)
      }

      getChatIDs();
    }
  }, [guestId]);

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
            guest_id: guestId,
            chat_id: chatId,
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
      setchatId(res.chat_id);
      setchatIds((preval) => {
        return preval ? [...new Set([...preval, res.chat_id])] : [res.chat_id];
      });
    } catch (err) {
      setLoading(false);
    }
  };

  const handleChange = async (e: any) => {
    setLoading(true)
    setMessages([])
    const res = await (
      await fetch(
        "http://127.0.0.1:8000/api/v1/chat/get-chat-details/" + e.target.value
      )
    ).json();

    setMessages(res)
    setLoading(false)
  }

  const handleNew = () => {
    setMessages([])
    setchatId(null)
  }

  return (
    <Container className="mycontainer">
      <Row className="w-100">
        <Col>
          <div className="row d-flex align-items-center justify-contents-between">
            <div className="col">Guest ID: {guestId} <br /> <FontAwesomeIcon icon={faCirclePlus} style={{cursor:"pointer"}} onClick={handleNew} /></div>
            <div className="col">
              <Form.Select onChange={handleChange}>
                <option>Select Chat ID</option>
                {chatIds?.map((chat) => {
                  return (
                    <option value={chat} key={chat} selected={chat === chatId}>
                      {chat}
                    </option>
                  );
                })}
              </Form.Select>
            </div>
          </div>
          <br />
          <div className="chat-window">
            {messages.map((message, index) => (
              <div
                key={index}
                className={
                  message.type === "self"
                    ? "justify-content-end w-100 d-flex align-items-center"
                    : "w-100 d-flex align-items-center"
                }
              >
                <div
                  className={
                    message.type === "self" ? "user-message" : "bot-message"
                  }
                  style={{ whiteSpace: "pre-wrap" }}
                  ref={messages.length - 1 === index ? lastMsg : null}
                >
                  {message.text}
                </div>
              </div>
            ))}
          </div>
          <Form onSubmit={handleMessageSubmit} className="mt-3">
            <InputGroup className="mb-3">
              <Form.Control
                as="textarea"
                style={{ minHeight: "100px" }}
                placeholder="Type your message..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
              />
              <button type="submit" className="sendbtn">
                <FontAwesomeIcon icon={faPaperPlane} />
              </button>
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
