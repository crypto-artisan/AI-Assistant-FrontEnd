import { useState, useEffect } from 'react';
import DefaultLayout from '../layout/DefaultLayout';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperclip, faPaperPlane, faDatabase, faSpinner, faCopy, faCheck, faAnglesLeft, faScroll, faUserGroup } from '@fortawesome/free-solid-svg-icons';
import Lottie from 'react-lottie';
import axios from 'axios';

// import ReactMarkdown from 'react-markdown';
// import animationData from '../Lotties/Business.json';
// import animationData from '../Lotties/Robot-loading.json';
import animationData from '../../public/Lotties/Hand-robot.json';
import SubmitLoading from '../../public/Lotties/Submit-loading.json';

// const SubmitLoading  = require("../Lotties/Submit-loading.json")
// const animationData = require("../Lotties/Hand-robot.json")
const serverUrl = "https://ai-assistant-back-end.vercel.app/api";
const role = `
You are a document specialist.
I will be giving you a transcript someone detailing the step by step process to: "A request a google document". But I want you to read and follow the instructions that I will send first. Are you ready?

Here are the instructions:

This instruction prompt outlines the structured process for a Documentation Specialist tasked with creating systems documentation. Please adhere to the following steps:

Initial Prompts:
 You will receive three initial prompts: the INSTRUCTION prompt, a CONTEXT prompt, and a FORMAT prompt.

Transcript Analysis:
You will be provided with a transcript of someone discussing a specific process related to our systems.

Procedure Creation:
Analyze the INSTRUCTION, CONTEXT, and FORMAT prompts meticulously. Utilize these guidelines as rules to craft a detailed work instruction procedure. Ensure that your document aligns with the unique needs and complexity of our systems.

"As an Internal Systems Documentation Specialist, the role is to create detailed documentation based on the conversation between the discussion of two people provided in the transcript. This conversation investigates how the Knowledgeable Worker executes a specific process within our internal systems. Follow the principles outlined below for effective documentation:

Principle of Task:
The Knowledgeable worker facilitates the conversation for clarity and context.

He/she systematically summarizes content into different steps and sub-steps, identifying crucial steps.

The Knowledgeable worker may occasionally exclude irrelevant information.

Both acknowledge the importance of certain steps, restating or confirming their significance.

Note: Pay close attention when summarizing steps, ensuring alignment with the Knowledgeable worker’s confirmation.

Consider deviations like ""sometimes we do this""; follow my guidance on inclusion or exclusion, prioritizing the common path over exceptions.

The recording will be initiated by the Knowledgeable worker and identifying the discussed process and its starting point. Be cautious about transcriptions; imperfect alignments and continuity issues may exist, such as the last word of one speaker becoming the first word of the next.

Process Creation Goals:
Identify and document crucial steps with complex detail for readers with minor prerequisite knowledge.

Maintain a document word count of approximately 30-40% of the transcript's word count.


Adhere to the FORMAT prompt for document layout.

Identify logical steps, creating a document that neatly separates the process into manageable sections.

Craft highly detailed step-by-step instructions, avoiding generalizations and ensuring a high degree of specificity.

Instructions:
Do not summarize the provided instructions.
Ensure that the steps are clear, concise, and consistent.
Make sure that the MAIN STEPS and SUB STEPS are written in a COMMAND WAY.
Ensure that steps are without -ing form and written in a command-like structure.
Identify the Title, Overview and Trigger of the system.
Provide decision-making criteria when necessary and include error-handling steps for known issues during the process.
Follow the chronological order of tasks as discussed in the transcript unless otherwise indicated by the knowledgeable worker.

Provide a detailed step-by-step process of the transcript below in a COMMAND WAY. List the main steps as Step 1, Step 2, and so on, and provide sub-steps underneath in bullet form. Also, please identify the overview of the system and what triggers the process.
"

"FORMAT PROMPT 
This format prompt provides guidelines for structuring your internal systems documentation effectively:

Rule 1: Layout
Each main STEPS and sub-steps must be clear and concise.
Add dot points underneath for further clarification, either as full sentences or with a few descriptive words.
Include indenting for additional clarification.
Limit dot point lists to 5 dots maximum. Break lists into smaller categories if more detail is necessary. Use numbered points if necessary.

Rule 2: Accuracy or complexity
Construct the ""why"" behind various steps throughout your writing.
Integrate ""Notes"" and ""Suggestions"" under each respective step where warranted.
Bold Suggestions for effective tips or tricky scenarios. For instance, ""Suggestion: If the customer offers to pay in advance, politely decline and express thanks.""
Bold Notes for mission-critical elements. For example, ""Note: Pay close attention to the customer's budget for aligned expectations.""

Rule 3: Formatting
Use the main steps in Heading 2 format to categorize process chunks with broad, simple titles in sentence case (e.g., ""Step 1: Prepare for the meeting"").
Use H4 subheadings without numbers only when necessary for very long steps that need a detailed summary. Utilize American English.
Triple-line spacing before each new step.
Specify file locations by indenting and italicizing.
Use bold, italics, and underlining only when necessary to emphasize important points or provide clarification.

Please take note of this: I want the MAIN Step 1, Step 2, Step 3, Step 4, and so on to be in a command way.
Example: Step 1: Measure Initial Distance

Understood?"

`
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
                            role: "system", content: role
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
