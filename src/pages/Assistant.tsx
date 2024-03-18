import { useState, useEffect } from 'react';
import DefaultLayout from '../layout/DefaultLayout';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperclip, faPaperPlane, faDatabase, faSpinner, faCopy, faCheck, faAnglesLeft, faScroll, faUserGroup, faCircleExclamation, faPlusCircle } from '@fortawesome/free-solid-svg-icons';
import { toast, ToastContainer } from 'react-toastify';
import "react-toastify/dist/ReactToastify.css";
import Lottie from 'react-lottie';
import { GPTTokens } from "gpt-tokens"

import animationData from '../../public/Lotties/Hand-robot.json';
import SubmitLoading from '../../public/Lotties/loading (3).json';

const serverUrl = "https://ai-assistant-back-end-pi.vercel.app/api";
const tokenLimit = 8192;
const apikey = import.meta.env.VITE_REACT_APP_OPENAI_API_KEY;

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
    //instruction
    const [instruction, setInstruction] = useState<string>("");
    const [singlePersonPrompt, setSinglePersonPrompt] = useState<string>("");
    const [multiPersonPrompt, setMultiPersonPrompt] = useState<string>("");
    //tokens
    const [usedTokens, setUsedTokens] = useState<number>(8192);
    //loading status
    const [submitLoading, setSubmitLoading] = useState(false);
    const [responseExist, setResponseExist] = useState(false);
    //prompting
    const [transcript, setTranscript] = useState<string>("");
    const [processType, setProcessType] = useState<string>("");
    const [peopleNumber, setPeopleNumber] = useState<string>("");
    //Gpt response
    const [completion, setCompletion] = useState("");
    //Error message
    const [typeErrorMessage, setTypeErrorMessage] = useState("");
    const [numberErrorMessage, setNumberErrorMessage] = useState("");
    const [transcriptErrorMessage, setTranscriptErrorMessage] = useState("");
    //import singlePersonPrompt and multiPersonPrompt from google sheet.
    useEffect(() => {
        let response1; //
        const fetchData1 = async () => {
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
            setSinglePersonPrompt(data1.result);
        }
        const fetchData2 = async () => {
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
            setMultiPersonPrompt(data2.result);
        }
        fetchData1();
        fetchData2();
    })
    //calculate tokens of prompt
    useEffect(() => {
        if (peopleNumber.trim() == "") {
            setInstruction("");
        }
        else if (peopleNumber == "1") {
            setInstruction(`%ProcessType% is ${processType}.\n${singlePersonPrompt}`);
        }
        else {
            setInstruction(`%number of people% is ${peopleNumber} and %ProcessType% is ${processType}.\n${multiPersonPrompt}`);
        }
        const usageInfo = new GPTTokens({
            model: 'gpt-4',
            messages: [
                {
                    role: "system", content: instruction
                },
                { role: "user", content: transcript },
            ],
        })
        let used = usageInfo.usedTokens - 11;
        setUsedTokens(used)
    }, [transcript])
    //clipboard
    const [isCopied, setIsCopied] = useState(false);
    //handle input required validation message
    useEffect(() => {
        if (transcript.trim() !== "") setTranscriptErrorMessage("");
        if (processType.trim() !== "") setTypeErrorMessage("");
        if (peopleNumber.trim() !== "") setNumberErrorMessage("");
    }, [processType, peopleNumber, transcript])

    // const handleLoad = async () => {  //import transcript from google sheet
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

    //back button
    const handleBack = () => {
        setSubmitLoading(false);
        setResponseExist(false);
    }
    //regenerate button
    const handleRegenerate = () => {
        setSubmitLoading(false);
        setResponseExist(false);
        handleSubmit();
    }
    //submit into openai
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
                        { role: "user", content: transcript },
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
    //result copy button
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
    //add transcript from openfileform
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
                            height={260}
                            width={260}
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
                            height={260}
                            width={260}
                        />
                    </div>
                )
            }
            {
                (submitLoading && responseExist) &&
                (
                    <div className='flex flex-row-reverse absolute z-[100] top-[-50px] right-5 w-30'>
                        <button onClick={handleBack} className="bg-gradient-to-r from-[#6ebbd6af] to-[#61c6ea] hover:opacity-70 text-white font-bold py-2 px-4 rounded ml-2 flex items-center">
                            <FontAwesomeIcon icon={faAnglesLeft} className="mr-5" />
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
                        <div style={{ height: "80%", minHeight: "75%", maxHeight: "75%" }} className="relative mx-5 mt-20 sm:h-[70%] sm:min-h[70%] min-h[70%] h-[70%] overflow-hidden max-w-[100%] overflow-y-auto overflow-x-hidden py-[5%] dark:bg-gradient-to-r dark:to-[#045d7e] dark:from-[#033d52] bg-gradient-to-r to-[#6ebbd6af] from-[#61c6ea] rounded-xl dark:text-[#fff] text-[#000000c5] font-sans font-medium text-xl m-0 p-0">
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
                        <div className="sm:mx-20 mx-10 bg-transparent flex flex-col">
                            <form className="w-full">
                                <label htmlFor="processType" className="block text-md mb-2 font-medium text-gray-700">What type of process are you looking to document?*</label>
                                <div className='relative'>
                                    <input
                                        id="processType"
                                        value={processType}
                                        onChange={(e) => setProcessType(e.target.value)}
                                        type="text"
                                        className="w-full px-3 text-lg min-h-14 bg-[#0000] placeholder:text-slate-400 dark:text-white text-black font-sans rounded-xl border-solid border-2 border-[#d2d5d7] focus:outline-none focus-within:border-[#61c6ea]" // Added padding-left to make space for the icon
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
                                <label htmlFor="peopleNumber" className="block text-md my-2 font-medium text-gray-700">How many people are talking in the transcript?*</label>
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
                                        className="w-full px-3 text-lg min-h-14 bg-[#0000] placeholder:text-slate-400 text-black dark:text-white font-sans rounded-xl border-solid border-2 border-[#d2d5d7] focus:outline-none focus-within:border-[#61c6ea]" // Added padding-left to make space for the icon
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
                                <div className="flex flex-row justify-between">
                                    <label htmlFor="transcript" className="block text-md my-2 font-medium text-gray-700">Please copy and paste your transcript below.*</label>
                                    <label htmlFor="transcript" className="block text-md my-2 font-medium text-gray-700">{usedTokens}/{tokenLimit}</label>
                                </div>
                                <div className='relative'>
                                    <textarea onKeyDown={handleKeyDown} onChange={(e) => setTranscript(e.target.value)} value={transcript} rows={4} className="resize-none overflow-y-auto w-full py-3 px-3 min-h-40 text-lg bg-[#0000] text-black dark:text-white border-[#d2d5d7] font-sans rounded-xl placeholder:text-slate-400 border-solid border-2 focus:outline-none focus-within:border-[#61c6ea]" placeholder="Enter transcript..." />
                                    {
                                        transcriptErrorMessage && (
                                            <div className='text-[#de1515] absolute top-[6%] right-5'>
                                                <h1 className='text-center'><span><FontAwesomeIcon icon={faCircleExclamation} className="mr-2" /></span>{transcriptErrorMessage}</h1>
                                            </div>
                                        )
                                    }
                                </div>
                                <div className="right-4 flex z-10 flex-row-reverse">
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
                                        accept=".txt"
                                        onChange={handleFileUpload}
                                        className="hidden"
                                        id="fileInput"
                                    />
                                    {/* Upload button */}
                                    <label htmlFor="fileInput" className="justify-center w-40 ml-2 bg-gradient-to-r from-[#61c6eaaf] to-[#61c6ea]  hover:opacity-70 text-white font-bold py-2 px-2 rounded flex items-center cursor-pointer">
                                        <FontAwesomeIcon icon={faPlusCircle} className="mr-2" />
                                        Add Script
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
