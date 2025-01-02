import React, { useState, useEffect, useContext, useRef } from "react";
import { useLocation } from "react-router-dom";
import PropTypes from "prop-types";
import axios from "../config/axios";
import {
  initializeSocket,
  receiveMessage,
  sendMessage,
} from "../config/socket";
import hljs from "highlight.js";
import Markdown from "markdown-to-jsx";
import { UserContext } from "../context/user.context";
import { getWebContainer } from "../config/webContainer";

function SyntaxHighlightedCode(props) {
  const ref = useRef(null);

  React.useEffect(() => {
    if (ref.current && props.className?.includes("lang-") && window.hljs) {
      window.hljs.highlightElement(ref.current);
      ref.current.removeAttribute("data-highlighted");
    }
  }, [props.className, props.children]);
  return <code {...props} ref={ref} />;
}

SyntaxHighlightedCode.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node,
};

const Project = () => {
  const location = useLocation();
  // console.log(location.state);
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);
  const [isModelOpen, setIsModelOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState([]);
  const [users, setUsers] = useState([]);
  const [project, setProject] = useState(location.state.project);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const { user } = useContext(UserContext);
  const messageBox = React.createRef();
  const [currentFile, setCurrentFile] = useState(null);
  const [openFiles, setOpenFiles] = useState([]);
  const [fileTree, setFileTree] = useState({});
  const [webContainer, setWebContainer] = useState(null);
  const [iframeUrl, setIframeUrl] = useState(null);
  const [runProcess, setRunProcess] = useState(null);

  const handleUserClick = (id) => {
    setSelectedUserId((prevSelectedUserId) => {
      const newSelectedUserId = new Set(prevSelectedUserId);
      if (newSelectedUserId.has(id)) {
        newSelectedUserId.delete(id);
      } else {
        newSelectedUserId.add(id);
      }
      // console.log(Array.from(newSelectedUserId));
      return newSelectedUserId;
    });
  };

  function sendMsg() {
    sendMessage("project-message", {
      message,
      sender: user,
      // projectId: project._id
    });
    setMessages((prevMessages) => [...prevMessages, { sender: user, message }]); // Update messages state
    setMessage("");
    scrollToBottom();
  }

  function WriteAiMessage(message) {
    const messageObject = JSON.parse(message);
    return (
      <div className="text-sm text-white rounded-md bg-slate-800 p-1 leading-4">
        <Markdown
          options={{
            overrides: {
              code: SyntaxHighlightedCode,
            },
          }}
        >
          {messageObject.text}
        </Markdown>
      </div>
    );
  }

  useEffect(() => {
    initializeSocket(project._id);
    if (!webContainer) {
      getWebContainer().then((container) => {
        setWebContainer(container);
        console.log("container started");
      });
    }
    receiveMessage("project-message", (data) => {
      if (data.sender._id == "ai") {
        const message = JSON.parse(data.message);
        // console.log(message);
        webContainer?.mount(message.fileTree);
        if (message.fileTree) {
          setFileTree(message.fileTree || {});
        }
        setMessages((prevMessages) => [...prevMessages, data]);
      } else {
        setMessages((prevMessages) => [...prevMessages, data]);
      }
      });

    axios
      .get(`/projects/get-project/${location.state.project._id}`)
      .then((res) => {
        console.log(res.data.project);
        setProject(res.data.project);
        // setFileTree(res.data.project.fileTree || {});
      });

    axios
      .get("/users/all")
      .then((res) => {
        setUsers(res.data.users);
      })
      .catch((err) => {
        console.log(err);
      });
      scrollToBottom();
  }, []);

  function addCollaborators() {
    axios
      .put("/projects/add-user", {
        projectId: location.state.project._id,
        users: Array.from(selectedUserId),
      })
      .then((res) => {
        console.log(res.data);
        setIsModelOpen(false);
      })
      .catch((err) => {
        console.log(err);
      });
  }

  function saveFileTree(fileTree) {
    axios.put('/projects/update-file-tree', {
        projectId: project._id,
        fileTree: fileTree
    }).then(res => {
        console.log(res.data)
    }).catch(err => {
        console.log(err)
    })
  }

  function scrollToBottom() {
    messageBox.current.scrollTop = messageBox.current.scrollHeight;
  }

  return (
    <main className="h-screen w-screen flex">
      <section className="left h-full md:w-80 overflow-hidden w-full">
        <div className="conversation-area  overflow-hidden md:h-full h-[75vh] relative flex flex-col justify-between bg-slate-200">
          <header className="flex w-full justify-between items-center px-4 md:py-2 py-3 bg-slate-100">
            <button onClick={() => setIsSidePanelOpen(!isSidePanelOpen)} className="flex gap-1">
              <i className="ri-list-check duration-200 px-1 bg-slate-50 hover:bg-slate-200"></i>
              <p>Add Collaborator</p>
            </button>
            <button onClick={() => setIsModelOpen(true)} className="duration-200 bg-slate-50 hover:bg-slate-200 flex items-center justify-center rounded-lg px-1">
              <i className="ri-add-fill"></i>
            </button>
          </header>
          <div ref={messageBox}
            className="message-box flex-grow flex flex-col gap-1 overflow-x-hidden rounded-md bg-slate-300 m-1 p-1 "
          >{messages.map((msg, index) => (
              <div
                key={index}
                className={`${
                  msg.sender._id === "ai" ? "max-w-60" : "max-w-52"
                } ${
                  msg.sender._id == user._id.toString() && "ml-auto"
                } text-xs flex flex-col p-2 bg-slate-50 w-fit rounded-md`}
              >
                <small className="opacity-65 text-xs px-1">
                  {msg.sender.email}
                </small>
                <div className="text-sm leading-4">
                  {msg.sender._id === "ai" ? (
                    WriteAiMessage(msg.message)
                  ) : (
                    <p>{msg.message}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="inputField w-full flex justify-between items-center">
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="p-1 px-2 border-none outline-none w-[85%]"
              type="text"
              placeholder="enter message"
            />
            <button
              onClick={sendMsg}
              className="px-4 py-1 bg-slate-500 text-white">
              <i className="ri-send-plane-fill"></i>
            </button>
          </div>
        </div>
        <div className={`sidePanel w-80 shadow-md shadow-neutral-400 gap-1
           p-1 h-full flex flex-col bg-slate-100 absolute transition-all top-0 z-10 ${
            isSidePanelOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <header className="flex justify-between items-center px-4 py-2 bg-slate-200">
            <div className="flex gap-1"><i className="ri-group-fill"></i>
            <h1 className="font-semibold "> 
              Collaborators</h1></div>
            <button onClick={() => setIsSidePanelOpen(!isSidePanelOpen)} className="duration-200 px-1 rounded-md bg-slate-100 hover:bg-slate-300">
              <i className="ri-close-fill"></i>
            </button>
          </header>
          <div className="users flex flex-col rounded-md">
            {project.users &&
              project.users.map((user) => {
                return (
                  <div
                    key={user._id}
                    className="user cursor-pointer rounded-md hover:bg-slate-50 border border-slate-100 hover:border-slate-200 px-2 py-1.5 flex gap-2 items-center">
                    <div className="aspect-square rounded-full w-fit h-fit flex items-center justify-center p-4 text-white bg-slate-500">
                      <i className="ri-user-fill absolute"></i>
                    </div>
                    <h1 className="font-semibold">{user.email}</h1>
                  </div>
                );
              })}
          </div>
        </div>
      </section>
      <section className="right hidden bg-zinc-100 flex-grow h-full md:flex">
        <div className="explorer h-full max-w-64 min-w-52 bg-slate-200 ">
          <div className="file-tree w-[95%]">
            {Object.keys(fileTree).map((file, index) => (
              <button
                key={index}
                onClick={() => {
                  setCurrentFile(file);
                  setOpenFiles([...new Set([...openFiles, file])]);
                }}
                className="tree-element cursor-pointer p-1 rounded-md m-1 px-4 flex items-center bg-slate-300 w-full">
                <p className="font-semibold ">{file}</p>
              </button>
            ))}
          </div>
        </div>
        <div className="code-editor h-full overflow-hidden flex flex-col w-[80%]">
          <div className="top flex justify-between w-full">
            {/* <div className="file flex">
              {openFiles.map((file, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentFile(file)}
                  className={`open-file cursor-pointer p-2 px-4 flex items-center w-fit gap-2 bg-slate-300 ${
                    currentFile === file ? "bg-slate-400" : ""
                  }`}
                >
                  <p className="font-semibold text-lg">{file}</p>
                </button>
              ))}
            </div> */}
            <div className="actions flex gap-2">
              <button
                onClick={async () => {
                  await webContainer.mount(fileTree);
                  const installProcess = await webContainer.spawn("npm", [
                    "install",
                  ]);

                  installProcess.output.pipeTo(
                    new WritableStream({
                      write(chunk) {
                        console.log(chunk);
                      },
                    })
                  );

                  if (runProcess) {
                    runProcess.kill();
                  }

                  let tempRunProcess = await webContainer.spawn("npm", [
                    "start",
                  ]);

                  tempRunProcess.output.pipeTo(
                    new WritableStream({
                      write(chunk) {
                        console.log(chunk);
                      },
                    })
                  );
                  setRunProcess(tempRunProcess);
                  webContainer.on("server-ready", (port, url) => {
                    console.log(port, url);
                    setIframeUrl(url);
                  });
                }}
                className="p-1 px-3 bg-slate-400 rounded-sm text-white"
              >
                Run to install dependencies only
              </button>
            </div>
          </div>
          <div className="bottom flex flex-grow w-full h-full">
            {fileTree[currentFile] && (
              <div className="code-editor-area h-full overflow-auto flex-grow bg-slate-50">
                <pre className="hljs h-full bg-zinc-600 text-white text-sm">
                  <code
                    className="hljs h-full outline-none"
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={(e) => {
                      const updatedContent = e.target.innerText;
                      const ft = {
                          ...fileTree,
                          [ currentFile ]: {
                              file: {
                                  contents: updatedContent
                              }
                          }
                      }
                      setFileTree(ft)
                      saveFileTree(ft)
                    }}
                    dangerouslySetInnerHTML={{
                      __html: hljs.highlight(
                        "javascript",
                        fileTree[currentFile].file.contents
                      ).value,
                    }}
                    style={{
                      whiteSpace: "pre-wrap",
                      paddingBottom: "25rem",
                      counterSet: "line-numbering",
                    }}
                  />
                </pre>
              </div>
            )}
          </div>
        </div>
        {iframeUrl && webContainer && (
          <div className="flex min-w-96 flex-col h-full">
            <div className="address-bar text-sm">
              <input
                type="text"
                onChange={(e) => setIframeUrl(e.target.value)}
                value={iframeUrl}
                className="w-full p-2 px-4 bg-slate-200"
              />
            </div>
            <iframe src={iframeUrl} className="w-full h-full"></iframe>
          </div>
        )}
      </section>
      {isModelOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-4 rounded-md w-80 max-w-full relative">
            <header className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Select User</h2>
              <button onClick={() => setIsModelOpen(false)} className="duration-200 bg-slate-100 px-1 rounded-md hover:bg-slate-200">
                <i className="ri-close-fill"></i>
              </button>
            </header>
            <div className="users-list flex flex-col gap-2 mb-16 max-h-96 overflow-auto">
              {users.map((user) => (
                <div
                  key={user._id}
                  className={`user cursor-pointer hover:bg-slate-200 ${
                    Array.from(selectedUserId).indexOf(user._id) != -1
                      ? "bg-slate-200"
                      : ""
                  } p-2 flex gap-2 items-center`}
                  onClick={() => handleUserClick(user._id)}
                >
                  <div className="aspect-square relative rounded-full w-fit h-fit flex items-center justify-center p-4 text-white bg-slate-500">
                    <i className="ri-user-fill absolute"></i>
                  </div>
                  <h1 className="font-semibold">{user.email}</h1>
                </div>
              ))}
            </div>
            <button
              onClick={addCollaborators}
              className="absolute bottom-4 left-1/2 transform -translate-x-1/2 px-3 py-2 bg-zinc-700 hover:bg-neutral-600 text-white rounded-md">
              Add Collaborator
            </button>
          </div>
        </div>
      )}
    </main>
  );
};

export default Project;
