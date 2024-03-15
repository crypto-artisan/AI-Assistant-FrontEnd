import { useState, useEffect } from 'react';
import DefaultLayout from '../layout/DefaultLayout';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperclip, faPaperPlane, faDatabase, faSpinner, faCopy, faCheck, faAnglesLeft, faScroll, faUserGroup, faCircleExclamation } from '@fortawesome/free-solid-svg-icons';
import { toast, ToastContainer } from 'react-toastify';
import "react-toastify/dist/ReactToastify.css";
import Lottie from 'react-lottie';

import animationData from '../../public/Lotties/Hand-robot.json';
// import SubmitLoading from '../../public/Lotties/Submit-loading.json';
// import SubmitLoading from '../../public/Lotties/loading (1).json';
// import SubmitLoading from '../../public/Lotties/loading (2).json';
import SubmitLoading from '../../public/Lotties/loading (3).json';

const serverUrl = "https://ai-assistant-back-end-pi.vercel.app/api";

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

    //loading status
    const [loading, setLoading] = useState(false);
    const [submitLoading, setSubmitLoading] = useState(true);
    const [responseExist, setResponseExist] = useState(true);
    //prompting
    const [prompt, setPrompt] = useState<string>("");
    const [transcript, setTranscript] = useState<string>("");
    const [processType, setProcessType] = useState<string>("");
    const [peopleNumber, setPeopleNumber] = useState<string>("");
    //gpt response
    const [completion, setCompletion] = useState("");
    const [messages, setMessages] = useState<Message[] | null>(null);
    const [typeErrorMessage, setTypeErrorMessage] = useState("");
    const [numberErrorMessage, setNumberErrorMessage] = useState("");
    const [transcriptErrorMessage, setTranscriptErrorMessage] = useState("");
    //clipboard
    const [isCopied, setIsCopied] = useState(false);
    useEffect(() => {
        setPrompt(transcript);
        if (transcript.trim() !== "") setTranscriptErrorMessage("");
        if (processType.trim() !== "") setTypeErrorMessage("");
        if (peopleNumber.trim() !== "") setNumberErrorMessage("");
    }, [processType, peopleNumber, transcript])
    useEffect(() => {
        // setPrompt("");
        if (messages != null)
            setMessages([
                ...messages,
                { id: messages.length, text: completion, sender: "bot" },
            ]);
    }, [completion]);
    // const handleLoad = async () => {
    //     setLoading(true);
    //     try {
    //         if (peopleNumber.trim() == "") {
    //             // console.log("people number is empty");
    //             setNumberErrorMessage("Required!");
    //             toast.error("Type a number of people!",
    //                 {
    //                     position: toast.POSITION.TOP_RIGHT,
    //                     autoClose: 1500,
    //                     hideProgressBar: false,
    //                 })

    //             return;
    //         }
    //         else if (peopleNumber == "1") {
    //             const response = await fetch(`${serverUrl}/file-format`);
    //             if (!response.ok) {
    //                 toast.error("Something went wrong, please try again!",
    //                     {
    //                         position: toast.POSITION.TOP_RIGHT,
    //                         autoClose: 1500,
    //                         hideProgressBar: false,
    //                     })
    //                 throw new Error('Something went wrong, please try again!');
    //             }
    //             const data = await response.json();
    //             setTranscript(data.result);
    //         }
    //         else {
    //             const response = await fetch(`${serverUrl}/facebook-engagement`);
    //             if (!response.ok) {
    //                 toast.error("Something went wrong, please try again!",
    //                     {
    //                         position: toast.POSITION.TOP_RIGHT,
    //                         autoClose: 1500,
    //                         hideProgressBar: false,
    //                     })
    //                 throw new Error('Something went wrong, please try again!');
    //             }
    //             const data = await response.json();
    //             setTranscript(data.result);
    //         }

    //     } catch (error) {
    //         console.error('There was a problem with the fetch operation:', error);
    //     } finally {
    //         setLoading(false);
    //     }
    // };
    const handleBack = () => {
        setSubmitLoading(false);
        setResponseExist(false);
    }
    const handleRegenerate = () => {
        setSubmitLoading(false);
        setResponseExist(false);
        handleSubmit();
    }
    const handleKeyDown = (event: any) => {
        if (event.key === 'Enter' && event.shiftKey) {
            event.preventDefault(); // Prevent the default behavior
            // Insert a newline character at the current cursor position
            const start = event.target.selectionStart;
            const end = event.target.selectionEnd;
            const textarea = event.target;
            const textBefore = textarea.value.substring(0, start);
            const textAfter = textarea.value.substring(end, textarea.value.length);
            textarea.value = textBefore + '\n' + textAfter;
            textarea.selectionStart = textarea.selectionEnd = start + 1; // Move cursor to the next position
        }
        else if (event.key === 'Enter') {
            event.preventDefault(); // Prevent the default Enter key behavior
            handleSubmit();
        }
    };
    const handleSubmit = async () => {
        setSubmitLoading(true);
        if (processType.trim() == "" || peopleNumber.trim() == "" || transcript.trim() == "") {
            console.log("prompt is empty");
            toast.error("All fields Required!",
                {
                    position: toast.POSITION.TOP_RIGHT,
                    autoClose: 1500,
                    hideProgressBar: false,
                })
            setSubmitLoading(false);
            if (processType.trim() == "") {
                setTypeErrorMessage("Required!");
            }
            if (peopleNumber.trim() == "") {
                setNumberErrorMessage("Required!");
            }
            if (transcript.trim() == "") {
                setTranscriptErrorMessage("Required!");
            }
            return;
        }
        try {
            let instruction;
            if (peopleNumber == "1") {
                let response1;
                response1 = await fetch(`${serverUrl}/singleperson-prompt`);
                if (!response1.ok) {
                    toast.error("Something went wrong, please try again!",
                        {
                            position: toast.POSITION.TOP_RIGHT,
                            autoClose: 1500,
                            hideProgressBar: false,
                        })

                    throw new Error('Something went wrong, please try again!');
                }
                let data1 = await response1.json();
                instruction = `%ProcessType% is ${processType}.\n${data1.result}`;
                // console.log("people = 1 instruction", instruction);
            }
            else {
                let response2 = await fetch(`${serverUrl}/multiperson-prompt`);
                if (!response2.ok) {
                    toast.error("Something went wrong, please try again!",
                        {
                            position: toast.POSITION.TOP_RIGHT,
                            autoClose: 1500,
                            hideProgressBar: false,
                        })
                    throw new Error('Something went wrong, please try again!');
                }
                let data2 = await response2.json();
                instruction = `%number of people% is ${peopleNumber} and %ProcessType% is ${processType}.\n${data2.result}`;
                // console.log("people >= 1 instruction", instruction);
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
            // console.log("response data=========================>", data);
            setResponseExist(true);
            setCompletion(data.choices[0].message.content);

        } catch (error) {
            console.error('There was a problem with the fetch operation:', error);
            toast.error("Something went wrong, please try again!",
                {
                    position: toast.POSITION.TOP_RIGHT,
                    autoClose: 1500,
                    hideProgressBar: false,
                })
            handleBack();
        } finally {
            console.log("responseExist--------->", responseExist);
        }
    };
    const handleTextareaEdit = (event: any) => {
        setTranscript(event.target.value);
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
    return (
        <DefaultLayout>
            <ToastContainer />
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
                            width={600}
                        />
                    </div>
                )
            }
            {
                (submitLoading && responseExist) &&
                (
                    <div className='flex flex-row-reverse absolute z-[100] top-[-50px] right-2 w-30'>
                        <button onClick={handleBack} className="bg-gradient-to-r from-[#6ebbd6af] to-[#61c6ea] hover:opacity-70 text-white font-bold py-2 px-4 rounded ml-2 flex items-center">
                            <FontAwesomeIcon icon={faAnglesLeft} className="mr-2" />
                            Back
                        </button>
                        <button onClick={handleRegenerate} className="right-2 bg-gradient-to-r from-[#6ebbd6af] to-[#61c6ea] hover:opacity-70 text-white font-bold py-2 px-4 rounded ml-2 flex items-center">
                            <FontAwesomeIcon icon={faPaperPlane} className="mr-2" />
                            Regenerate
                        </button>
                    </div>
                )
            }

            {
                (submitLoading && responseExist) ?
                    (
                        <div style={{ height: "80%", minHeight: "75%", maxHeight: "75%" }} className="relative mt-20 sm:h-[70%] sm:min-h[70%] min-h[70%] h-[70%] mx-2 overflow-hidden max-w-[100%] overflow-y-auto overflow-x-hidden py-[5%] dark:bg-gradient-to-r dark:to-[#045d7e] dark:from-[#033d52] bg-gradient-to-r to-[#6ebbd6af] from-[#61c6ea] rounded-xl dark:text-[#fff] text-[#000000c5] font-sans font-medium text-xl m-0 p-0">
                            <pre style={{ textAlign: 'left', whiteSpace: "pre-line", justifyContent: "space-around" }} className="sm:ml-[50px] ml-[10px] max-w-[100%] whitespace-pre-wrap">{completion}</pre>
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
                            <form className="w-full">
                                <label htmlFor="processType" className="block text-md mb-3 font-medium text-gray-700">What type of process are you looking to document?</label>
                                <div className='relative'>
                                    <input
                                        id="processType"
                                        value={processType}
                                        onChange={(e) => setProcessType(e.target.value)}
                                        type="text"
                                        className="w-full px-3 text-xl min-h-14 bg-[#0000] placeholder:text-slate-400 dark:text-white text-black font-sans rounded-xl border-solid border-2 border-[#d2d5d7] focus:outline-none focus-within:border-[#61c6ea]" // Added padding-left to make space for the icon
                                        placeholder="Enter description of process..."
                                    />
                                    {
                                        typeErrorMessage && (
                                            <div className='text-[#de1515] absolute top-[28%] right-5'>
                                                <h1 className='text-center'><span><FontAwesomeIcon icon={faCircleExclamation} className="mr-2" /></span>{typeErrorMessage}</h1>
                                            </div>
                                        )
                                    }

                                </div>

                            </form>
                            <form className="w-full mt-3">
                                <label htmlFor="peopleNumber" className="block text-md mb-3 font-medium text-gray-700">How many people are talking in the transcript?</label>
                                <div className='relative'>
                                    <input
                                        id="peopleNumber"
                                        value={peopleNumber}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            // Check if the input is a digit
                                            if (/^\d+$/.test(value)) {
                                                setPeopleNumber(value);
                                            } else {
                                                // Optionally, clear the input or set it to a default value
                                                setPeopleNumber("");
                                            }
                                        }}
                                        type="text"
                                        className="w-full px-3 text-xl min-h-14 bg-[#0000] placeholder:text-slate-400 text-black dark:text-white font-sans rounded-xl border-solid border-2 border-[#d2d5d7] focus:outline-none focus-within:border-[#61c6ea]" // Added padding-left to make space for the icon
                                        placeholder="Enter number..."
                                    />
                                    {numberErrorMessage && (
                                        <div className='text-[#de1515] absolute top-[28%] right-5'>
                                            <h1 className='text-center'><span><FontAwesomeIcon icon={faCircleExclamation} className="mr-2" /></span>{numberErrorMessage}</h1>
                                        </div>
                                    )
                                    }
                                </div>
                            </form>
                            {/* </div> */}
                            <div className="my-3">
                                <label htmlFor="transcript" className="block text-md mb-3 font-medium text-gray-700">Please copy and paste your transcript below.</label>
                                <div className='relative'>
                                    <textarea onKeyDown={handleKeyDown} onChange={handleTextareaEdit} value={transcript} rows={5} className="resize-none overflow-y-auto w-full py-3 px-3 min-h-60 text-xl bg-[#0000] text-black dark:text-white border-[#d2d5d7] font-sans rounded-xl placeholder:text-slate-400 border-solid border-2 focus:outline-none focus-within:border-[#61c6ea]" placeholder="Enter transcript..." />
                                    {
                                        transcriptErrorMessage && (
                                            <div className='text-[#de1515] absolute top-[6%] right-5'>
                                                <h1 className='text-center'><span><FontAwesomeIcon icon={faCircleExclamation} className="mr-2" /></span>{transcriptErrorMessage}</h1>
                                            </div>
                                        )
                                    }
                                </div>
                                <div className="right-4 bottom-0 flex z-10 flex-row-reverse" style={{ bottom: "20px" }}>
                                    {/* <button onClick={handleSubmit} className="w-25 bg-gradient-to-r from-[#7a2dc1] to-[#dd00ac]  hover:opacity-70 text-white font-bold py-2 px-2 rounded ml-2 flex items-center"> */}
                                    <button onClick={handleSubmit} className="justify-center w-40 bg-gradient-to-r from-[#61c6eaaf] to-[#61c6ea]  hover:opacity-70 text-white font-bold py-2 px-2 rounded ml-2 flex items-center">
                                        {
                                            submitLoading ? (<FontAwesomeIcon icon={faSpinner} spin />)
                                                :
                                                (<FontAwesomeIcon icon={faPaperPlane} className="mr-2" />)
                                        }
                                        Generate
                                    </button>
                                    <input
                                        type="file"
                                        accept=".txt,.doc,.docx"
                                        onChange={handleFileUpload}
                                        className="hidden"
                                        id="fileInput"
                                    />
                                    {/* Upload button */}
                                    <label htmlFor="fileInput" className="justify-center w-40 ml-2 bg-gradient-to-r from-[#61c6eaaf] to-[#61c6ea]  hover:opacity-70 text-white font-bold py-2 px-2 rounded flex items-center cursor-pointer">
                                        <FontAwesomeIcon icon={faPaperclip} className="mr-2" />
                                        Script Upload
                                    </label>
                                    {/* <button onClick={handleLoad} className="bg-gradient-to-r from-blue-700 to-blue-500  hover:opacity-70 text-white font-bold py-2 px-2 rounded ml-2 flex items-center">
                                        {
                                            loading ? (<FontAwesomeIcon icon={faSpinner} spin />)
                                                :
                                                (<FontAwesomeIcon icon={faDatabase} className="mr-2" />)
                                        }
                                        Google
                                    </button> */}

                                </div>
                            </div>
                        </div>
                    )
            }
        </DefaultLayout >
    );
};

export default Assistant;
