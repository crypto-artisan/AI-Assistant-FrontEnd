import { useState, useEffect } from 'react';
import DefaultLayout from '../layout/DefaultLayout';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperclip, faPaperPlane, faDatabase, faSpinner, faCopy, faCheck, faAnglesLeft, faScroll, faUserGroup } from '@fortawesome/free-solid-svg-icons';
import Lottie from 'react-lottie';
// import ReactMarkdown from 'react-markdown';
// import animationData from '../Lotties/Business.json';
// import animationData from '../Lotties/Robot-loading.json';
import animationData from '../../public/Lotties/Hand-robot.json';
import SubmitLoading from '../../public/Lotties/Submit-loading.json';

// const SubmitLoading  = require("../Lotties/Submit-loading.json")
// const animationData = require("../Lotties/Hand-robot.json")
const serverUrl = "http://localhost:5000/api";

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
    const [transcript, setTranscript] = useState("");
    const [prompt, setPrompt] = useState("");
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
            // Submit the form programmatically
            handleSubmit();
        }
    };
    const handleSubmit = async () => {
        console.log("submit....")
        setErrorMessage("");
        setSubmitLoading(true);
        if (prompt.trim() == "") {
            console.log("prompt is empty");
            setSubmitLoading(false);
            setErrorMessage("All fields Required!");
            return;
        }
        console.log("-----prompt-------", prompt);
        let num = 0;
        if (messages != null) {
            num = messages?.length;
            setMessages([...messages, { id: num, text: prompt, sender: "user" }]);
        } else {
            num = 0;
            setMessages([{ id: 0, text: prompt, sender: "user" }]);
        }
        // setResponseExist(true);
        try {
            // Replace 'your-api-url' with the actual URL of your REST API
            // const response = await fetch(`${serverUrl}/proprietary-assistant`, {
            //     method: 'POST',
            //     headers: {
            //         'Content-Type': 'application/json',
            //     },
            //     body: JSON.stringify({ prompt: prompt }),
            // });
            // if (!response.ok) {
            //     throw new Error('Network response was not ok');
            // }
            // const data = await response.json();
            // setCompletion(data.result);
            const response = `
            Overview of the System:
            The system involves filing a request for formatting a Google document according to the company's style standards.\n
            Trigger:
            The trigger for this process is having a Google document that needs to be formatted for external sharing with clients or customers.
            Step 1: Duplicate the Task
            Command: Duplicate the task "gddoc/document formatting request" in Asana under Systems, Policies, and Training.
            Go to Asana and navigate to Systems, Policies, and Training.
            Locate the specific task "gddoc/document formatting request" and duplicate it.
            Step 2: Rename the Task
            Command: Rename the duplicated task to match the actual file name of your Google document (e.g., "Certification Team Member Agreement").
            Update the task name to reflect the document being formatted.
            Step 3: Fill Out Job Request Form
            Command: Edit the job request form and insert the link to your document.
            If the document is not in Google, upload it.
            Determine the priority level (low, mid, high) and tag the knowledgeable worker.
            Step 4: Additional Details
            Command: Provide additional information as needed.
            Specify the folder location for saving the document if necessary.
            Add any notes or instructions for formatting requirements.
            Step 5: Assign to Documentation Specialist
            Command: Assign the task to a documentation specialist (e.g., Joe) with a due date.
            Set a reasonable timeframe for completion (e.g., two weeks).
            Step 6: Completion
            Command: Complete the task once assigned.
            Verify that all necessary information has been provided and subtasks are marked as complete.`;
            setCompletion(response);
            // setResponseExist(true);            
            setTimeout(() => setResponseExist(true), 1000);
        } catch (error) {
            console.error('There was a problem with the fetch operation:', error);
            setErrorMessage("Network Error! Please try again.");
        } finally {
            console.log("transcript", transcript)
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
                        <div className="sm:h-[70%] h-[35%] mx-2 overflow-hidden max-w-[100%] overflow-y-auto overflow-x-hidden relative py-[5%] bg-gradient-to-r to-[#045d7e] from-[#033d52] rounded-xl text-[#fff] font-sans font-medium text-xl m-0 p-0">
                            {/* <ReactMarkdown>{completion}</ReactMarkdown> */}
                            <pre style={{textAlign:'left', whiteSpace:"pre-line", justifyContent:"space-around"}} className="sm:ml-[100px] ml-[20px] max-w-[100%] whitespace-pre-wrap">{completion}</pre>
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
