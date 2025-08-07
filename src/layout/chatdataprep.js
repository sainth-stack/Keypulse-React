// MiddleContent.js

import { Box, CircularProgress, Grid, IconButton } from "@mui/material"
import TextField from '@mui/material/TextField';
import { useEffect, useState } from "react";
import axios from "axios";
// import '../../../../genAi/Main.css'
import {  InputAdornment } from '@mui/material';
import { IoMdClose, IoMdRefresh, IoMdSend } from 'react-icons/io';
import AnswersChat2 from "./answers";
import { API_URL } from "../const";
const ChatDataPrep = ({ showModel, setShowModel }) => {
    const fileName = localStorage.getItem('filename')?.replace(/\.[^/.]+$/, '');
    const [search, setSearch] = useState('')
    const [answers, setAnswers] = useState([]);

    const handleSubmit = () => {
        if (search.trim()) {
            handleQuestionClick(search);
            setSearch("");
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    };

    const handleGetAnswer = async (question, data) => {
        var formData = new FormData();
        formData.append('prompt', question);
        const endpoint = `${API_URL}/genai_bot`;

        // Get user ID from localStorage
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const userId = user.id;

        try {
            const res = await axios.post(
                `${endpoint}`,
                formData,
                {
                    headers: {
                        'X-User-ID': userId,
                    }
                }
            );
            const ans = data.map((item) => {
                if (item.question == question) {
                    return {
                        ...item,
                        view: "Text",
                        answer: (res?.data?.chart_response || res?.data?.plot) ? "" : (res?.data?.text_output || res?.data?.text_pre_code_response),
                        graph: res?.data?.chart_response || res?.data?.plot,
                        loading: false,
                        isHtml: true // Add flag to indicate HTML content
                    }
                } else return item;
            })
            console.log(ans)
            setAnswers(ans)
        } catch (err) {
            const ans = data.map((item) => {
                if (item.question == question) {
                    return {
                        ...item,
                        answer: "No Data found",
                        loading: false,
                        isHtml: false
                    }
                } else return item;
            })
            setAnswers(ans)
        }
    }

    const handleQuestionClick = async (question) => {
        const data = [...answers, { question, answer: "", loading: true }]
        setAnswers(data);
        handleGetAnswer(question, data)
    };

    return (
      showModel && (
        <Box
          title=""
          sx={{
            position: "fixed",
            top: "64%",
            right: "1rem",
            transform: "translateY(-50%)",
            width: "700px",
            height: "70vh",
            background: "#fff",
            borderRadius: "12px",
            boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.15)",
            overflow: "hidden",
            zIndex: 1300,
            display: "flex",
            flexDirection: "column"
          }}
        >
          {/* Header */}
          <Box sx={{
            padding: "16px",
            borderBottom: "1px solid #e0e0e0",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between"
          }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <span style={{ fontWeight: 600 }}>Bot</span>
            </Box>
            <IconButton
              onClick={() => setShowModel(false)}
              sx={{ color: "#666" }}
            >
              <IoMdClose size={20} />
            </IconButton>
          </Box>

          {/* Chat Messages Area */}
          <Box sx={{
            flex: 1,
            overflow: "auto",
            padding: "16px",
            display: "flex",
            flexDirection: "column",
            gap: "16px"
          }}>
            {answers?.map((item, index) => (
              <div key={index} style={{
                display: "flex",
                flexDirection: "column",
                gap: "8px"
              }}>
                {/* User Message */}
                <Box sx={{
                  alignSelf: "flex-end",
                  maxWidth: "80%",
                  backgroundColor: "#f0f0f0",
                  padding: "12px",
                  borderRadius: "12px 12px 0 12px",
                }}>
                  {item.question}
                </Box>

                {/* AI Response */}
                <Box sx={{
                  alignSelf: "flex-start",
                  maxWidth: item?.answer ? "100%" : "80%",
                  backgroundColor: "#fff",
                  padding: "12px",
                  width: item?.answer ? "100%" : "80%",
                  borderRadius: "12px 12px 12px 0",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                }}>
                  {item.loading ? (
                    <CircularProgress size={20} />
                  ) : (
                    <>
                      {item.answer && item.isHtml ? (
                        <div 
                          dangerouslySetInnerHTML={{ __html: item.answer }}
                          style={{
                            overflow: 'auto',
                            maxHeight: '500px',
                            '& table': {
                              borderCollapse: 'collapse',
                              width: '100%',
                              marginBottom: '1rem'
                            },
                            '& th, & td': {
                              border: '1px solid #ddd',
                              padding: '8px',
                              textAlign: 'left'
                            },
                            '& th': {
                              backgroundColor: '#f5f5f5'
                            }
                          }}
                        />
                      ) : (
                        <div>{item.answer}</div>
                      )}
                      {item.graph && (
                        <AnswersChat2
                          question={item.question}
                          answer={item.answer}
                          graph={typeof item.graph === 'string' ? JSON.parse(item.graph) : item.graph}
                          loading={false}
                          type={item.view}
                          name={"genbi"}
                        />
                      )}
                    </>
                  )}
                </Box>
              </div>
            ))}
          </Box>

          {/* Input Area */}
          <Box sx={{
            padding: "16px",
            borderTop: "1px solid #e0e0e0",
            backgroundColor: "#fff"
          }}>
            <TextField
              fullWidth
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message here..."
              variant="outlined"
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "24px",
                  backgroundColor: "#f5f5f5",
                }
              }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={handleSubmit}
                      sx={{
                        color: search ? "primary.main" : "#bbb"
                      }}
                    >
                      <IoMdSend />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Box>
        </Box>
      )
    );
}

export default ChatDataPrep;
