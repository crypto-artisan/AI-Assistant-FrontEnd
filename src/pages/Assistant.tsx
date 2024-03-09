import { useState, useEffect } from 'react';
import DefaultLayout from '../layout/DefaultLayout';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperclip, faPaperPlane, faDatabase, faSpinner, faCopy, faCheck, faAnglesLeft, faScroll, faUserGroup } from '@fortawesome/free-solid-svg-icons';
import Lottie from 'react-lottie';
// import axios from 'axios';

import animationData from '../../public/Lotties/Hand-robot.json';
import SubmitLoading from '../../public/Lotties/Submit-loading.json';

// const SubmitLoading  = require("../Lotties/Submit-loading.json")
// const animationData = require("../Lotties/Hand-robot.json")
const serverUrl = "http://95.216.2.26:5050/api";

const apikey = import.meta.env.VITE_REACT_APP_OPENAI_API_KEY;
interface Message {
    id: number;
    text: string;
    sender: string;
}

const Assistant = () => {
    const defaultOptions = {
        loop: true,
        autoplay: true,
        animationData: animationData,
        rendererSettings: {
            preserveAspectRatio: "xMidYMid slice"
        }
    };
    const submitLoadingOption = {
        loop: true,
        autoplay: true,
        animationData: SubmitLoading,
        rendererSettings: {
            preserveAspectRatio: "xMidYMid slice"
        }
    };
    const [textareaHeight, setTextareaHeight] = useState(5); // Default height in rows
    const handleTextareaChange = (event: any) => {
        const newHeight = event.target.scrollHeight / event.target.offsetHeight + 4;
        setTextareaHeight(newHeight);
    };
    //textarea validation
    const [isTextareaEmpty, setIsTextareaEmpty] = useState(true);

    //loading status
    const [loading, setLoading] = useState(false);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [responseExist, setResponseExist] = useState(false);
    //prompting
    const [transcript, setTranscript] = useState<string>("");
    const [instruction, setInstruction] = useState<string>("");
    const [prompt, setPrompt] = useState<string>("");
    const [processType, setProcessType] = useState<string>("");
    const [peopleNumber, setPeopleNumber] = useState<string>("");
    //gpt response
    const [completion, setCompletion] = useState("");
    const [messages, setMessages] = useState<Message[] | null>(null);
    const [errorMessage, setErrorMessage] = useState("");
    //clipboard
    const [isCopied, setIsCopied] = useState(false);
    useEffect(() => {
        setPrompt(transcript);
    }, [processType, peopleNumber, transcript])
    useEffect(() => {
        // setPrompt("");
        if (messages != null)
            setMessages([
                ...messages,
                { id: messages.length, text: completion, sender: "bot" },
            ]);
    }, [completion]);
    useEffect(() => {
        // setPrompt("");
        if (messages != null && errorMessage != "") {
            setMessages([
                ...messages,
                { id: messages.length, text: errorMessage, sender: "bot" },
            ]);
            // setErrorMessage("");
        }
    }, [errorMessage]);
    const handleLoad = async () => {
        setLoading(true);
        try {
            // Replace 'your-api-url' with the actual URL of your REST API
            // const response = await fetch(`${serverUrl}/singleperson-prompt`);
            const response = await fetch(`${serverUrl}/file-format`);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            setTranscript(data.result);
        } catch (error) {
            console.error('There was a problem with the fetch operation:', error);
        } finally {
            setLoading(false);
        }
    };
    const handleBack = async () => {
        setSubmitLoading(false);
        setResponseExist(false);
    }
    const handleKeyDown = (event: any) => {
        if (event.key === 'Enter') {
            event.preventDefault(); // Prevent the default Enter key behavior
            handleSubmit();
        }
    };
    const handleSubmit = async () => {
        console.log("api-key================>", apikey);
        setErrorMessage("");
        setSubmitLoading(true);
        if (prompt.trim() == "") {
            console.log("prompt is empty");
            setSubmitLoading(false);
            setErrorMessage("All fields Required!");
            return;
        }

        try {
            let response1;
            if (peopleNumber == "1") {
                response1 = await fetch(`${serverUrl}/singleperson-prompt`);
                if (!response1.ok) {
                    throw new Error('Network response was not ok');
                }
                const data1 = await response1.json();
                setInstruction(`%ProcessType% is ${processType}.\n${data1.result}`);
                console.log("people = 1", instruction);
            }
            else {
                response1 = await fetch(`${serverUrl}/multiperson-prompt`);
                if (!response1.ok) {
                    throw new Error('Network response was not ok');
                }
                const data1 = await response1.json();
                setInstruction(`%number of people% is ${peopleNumber} and %ProcessType% is ${processType}.\n${data1.result}`);
                console.log("people >= 1", instruction);
            }
            const response = await fetch(`https://api.openai.com/v1/chat/completions`, {
                method: "POST",
                headers: {
                    "Authorization": "Bearer " + apikey,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    model: "gpt-4",
                    messages: [
                        {
                            role: "system", content: instruction
                        },
                        { role: "user", content: prompt },
                    ],
                })
            });

            const data = await response.json();
            console.log("response data=========================>", data);
            setResponseExist(true);
            setCompletion(data.choices[0].message.content);

        } catch (error) {
            console.error('There was a problem with the fetch operation:', error);
            setErrorMessage("Network Error! Please try again.");
            setSubmitLoading(false);
        } finally {
            console.log("responseExist--------->", responseExist);
        }
    };
    const handleTextareaEdit = (event: any) => {
        setTranscript(event.target.value);
        setIsTextareaEmpty(event.target.value.trim() === '');
    };
    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(completion);
            setIsCopied(true);
            console.log('Text copied to clipboard');
            setTimeout(() => setIsCopied(false), 2000); // Revert back after 2 seconds
        } catch (err) {
            console.error('Failed to copy text: ', err);
        }
    };
    //file upload
    const handleFileUpload = (event: any) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e: any) => {
                // Assuming the file is a text file, you can directly set the value
                setTranscript(e.target.result);
            };
            reader.readAsText(file);
        }
    };
    const Message = ({ message }: { message: Message }) => {
        return (
            <>
                <>
                    {message.sender == "user" ? (
                        <FontAwesomeIcon icon={faPaperclip} className="mr-2" />

                    ) : (
                        <FontAwesomeIcon icon={faPaperclip} className="mr-2" />
                    )}
                    <div>
                        {message.text}
                    </div>
                </>
            </>
        );
    };
    return (
        <DefaultLayout>
            {
                (!submitLoading && !responseExist) &&
                (
                    <div className=''>
                        <Lottie
                            options={defaultOptions}
                            height={300}
                            width={300}
                        />
                    </div>
                )
            }
            {
                (submitLoading && !responseExist) &&
                (
                    <div className=''>
                        <Lottie
                            options={submitLoadingOption}
                            height={300}
                            width={300}
                        />
                    </div>
                )
            }
            {/* {messages?.map((message) => (
                <>
                    <Message key={message.id} message={message} />
                    <hr />
                </>
            ))} */}
            {
                (submitLoading && responseExist) &&
                (
                    <button onClick={handleBack} className="absolute z-[100] top-[-50px] right-2 w-30 bg-gradient-to-r from-[#6ebbd6af] to-[#61c6ea] hover:opacity-70 text-white font-bold py-2 px-4 rounded ml-2 flex items-center">
                        <FontAwesomeIcon icon={faAnglesLeft} className="mr-2" />
                        Back
                    </button>
                )
            }

            {
                (submitLoading && responseExist) ?
                    (
                        <div className="sm:h-[70%] sm:min-h[70%] min-h[35%] h-[35%] mx-2 overflow-hidden max-w-[100%] overflow-y-auto overflow-x-hidden relative py-[5%] bg-gradient-to-r to-[#045d7e] from-[#033d52] rounded-xl text-[#fff] font-sans font-medium text-xl m-0 p-0">
                            {/* <ReactMarkdown>{completion}</ReactMarkdown> */}
                            <pre style={{ textAlign: 'left', whiteSpace: "pre-line", justifyContent: "space-around" }} className="sm:ml-[100px] ml-[20px] max-w-[100%] whitespace-pre-wrap">{completion}</pre>
                            {/* <FontAwesomeIcon icon={faRobot} className="mr-2 absolute top-20 left-5" size='xl' /> */}
                            <button onClick={handleCopy} className="copy-button absolute top-5 right-5">
                                {isCopied ? (
                                    <FontAwesomeIcon icon={faCheck} size="xl" />
                                ) : (
                                    <FontAwesomeIcon icon={faCopy} size="xl" />
                                )}
                            </button>
                        </div>
                    )
                    :
                    (
                        <div className="mx-5 bg-transparent flex flex-col">
                            {/* <div className="bg-transparent flex space-x-4 justify-between"> */}
                            {/* <input value={processType} onChange={(e) => setProcessType(e.target.value)} type="text" className="w-full py-3 px-3 text-xl min-h-14 bg-[#0000] placeholder:text-slate-200 text-white dark:text-white font-sans rounded-xl border-solid border-2 border-[#35316f] focus-within:shadow-xl focus-within:shadow-[#35316f]" placeholder="What type of process are you looking to document?" /> */}
                            <form className="relative w-full">
                                <input
                                    value={processType}
                                    onChange={(e) => setProcessType(e.target.value)}
                                    type="text"
                                    className="w-full py-3 px-3 text-xl min-h-14 bg-[#0000] placeholder:text-slate-400 text-white dark:text-white font-sans rounded-xl border-solid border-2 border-[#61c6ea] focus-within:shadow-lg focus-within:shadow-[#61c6ea] pl-10 focus:outline-none" // Added padding-left to make space for the icon
                                    placeholder="*What type of process are you looking to document? (ex: Google Business)"
                                />
                                <FontAwesomeIcon
                                    icon={faScroll} // Replace faDatabase with the icon you want to use
                                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white" // Adjust positioning as needed
                                />
                            </form>
                            <form className="relative w-full mt-3">
                                <input
                                    value={peopleNumber}
                                    onChange={(e) => setPeopleNumber(e.target.value)}
                                    type="text"
                                    className="w-full py-3 px-3 text-xl min-h-14 bg-[#0000] placeholder:text-slate-400 text-white dark:text-white font-sans rounded-xl border-solid border-2 border-[#61c6ea] focus-within:shadow-lg focus-within:shadow-[#61c6ea] pl-10 focus:outline-none" // Added padding-left to make space for the icon
                                    placeholder="*How many people are in the transcript? (ex: 2)"
                                />
                                <FontAwesomeIcon
                                    icon={faUserGroup} // Replace faDatabase with the icon you want to use
                                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white" // Adjust positioning as needed
                                />
                            </form>
                            {/* </div> */}
                            <div className="relative">
                                {/* <textarea onChange={handleTextareaEdit} value={transcript} rows={textareaHeight} onInput={handleTextareaChange} className="overflow-y-auto w-full my-5 py-3 px-3 min-h-60 text-xl bg-[#0000] placeholder:text-slate-200 text-white dark:text-white font-sans rounded-xl ${isTextareaEmpty ? 'border-red-500' : 'border-[#35316f]'} border-solid border-2 border-[#35316f] focus-within:shadow-xl focus-within:shadow-[#35316f]" placeholder="*Please copy and paste your transcript below:" /> */}
                                <textarea onKeyDown={handleKeyDown} onChange={handleTextareaEdit} value={transcript} rows={textareaHeight} onInput={handleTextareaChange} className="overflow-y-auto w-full mt-3 py-3 px-3 min-h-60 text-xl bg-[#0000]  text-white dark:text-white border-[#61c6ea] font-sans rounded-xl placeholder:text-slate-400 border-solid border-2 focus-within:shadow-lg focus-within:shadow-[#61c6ea] focus:outline-none" placeholder="*Please copy and paste your transcript below:" />
                                <div className="absolute right-4 bottom-0 flex z-10" style={{ bottom: `${textareaHeight * 4}px` }}>
                                    {/* <button className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded flex items-center">
                                        <FontAwesomeIcon icon={faPaperclip} className="mr-2" />
                                        Upload
                                    </button> */}
                                    <input
                                        type="file"
                                        accept=".txt,.doc,.docx"
                                        onChange={handleFileUpload}
                                        className="hidden"
                                        id="fileInput"
                                    />
                                    {/* Upload button */}
                                    <label htmlFor="fileInput" className="bg-gradient-to-r from-[#61c6eaaf] to-[#61c6ea]  hover:opacity-70 text-white font-bold py-2 px-2 rounded flex items-center cursor-pointer">
                                        <FontAwesomeIcon icon={faPaperclip} className="mr-2" />
                                        Upload
                                    </label>
                                    <button onClick={handleLoad} className="bg-gradient-to-r from-blue-700 to-blue-500  hover:opacity-70 text-white font-bold py-2 px-2 rounded ml-2 flex items-center">
                                        {
                                            loading ? (<FontAwesomeIcon icon={faSpinner} spin />)
                                                :
                                                (<FontAwesomeIcon icon={faDatabase} className="mr-2" />)
                                        }
                                        Google
                                    </button>
                                    <button onClick={handleSubmit} className="w-25 bg-gradient-to-r from-[#7a2dc1] to-[#dd00ac]  hover:opacity-70 text-white font-bold py-2 px-2 rounded ml-2 flex items-center">
                                        {
                                            submitLoading ? (<FontAwesomeIcon icon={faSpinner} spin />)
                                                :
                                                (<FontAwesomeIcon icon={faPaperPlane} className="mr-2" />)
                                        }
                                        Submit
                                    </button>
                                    {/* {transcript && <div>{transcript}</div>} */}
                                </div>
                            </div>
                            <div className='flex flex-row w-full'>

                                <div className='w-full text-[#ff0202]'>
                                    <h1 className='text-center'>{errorMessage}</h1>
                                </div>

                            </div>

                        </div>
                    )
            }
        </DefaultLayout>
    );
};

export default Assistant;
