import { memo, useCallback, useRef, useState, useEffect } from "react";
import { Transition } from "@headlessui/react";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import FileViewerList from "./FileViewerList";
import LoadingText from "./LoadingText";
import { isFileNameInString } from "../services/utils";
import { FileChunk, FileLite } from "../types/file";

type FileQandAAreaProps = {
  files: FileLite[];
};

function FileQandAArea(props: FileQandAAreaProps) {
  const questionRef = useRef(null);
  const [hasAskedQuestion, setHasAskedQuestion] = useState(false);
  const [answerError, setAnswerError] = useState("");
  const [answerLoading, setAnswerLoading] = useState<boolean>(false);
  const [answer, setAnswer] = useState("");
  const [answerDone, setAnswerDone] = useState(false);
  const [questions, setQuestions] = useState<string[]>([]);
  const [isQuestionLoading, setIsQuestionLoading] = useState<boolean>(false);
  const [isQuestionPosted, setIsQuestionPosted] = useState<boolean>(false);

  const postQuestions = useCallback(
    async (question: string, answer: string) => {
      try {
        const searchResultsResponse = await axios.post(`/api/question`, {
          question,
          answer,
        });
        console.log("searchResultsResponse", searchResultsResponse.data);
        return searchResultsResponse;
      } catch (error: any) {
        console.log("error", error);
        throw new Error(`Something went wrong: ${error}`, { cause: error });
      }
    },
    []
  );

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const searchResultsResponse = await axios.get(`/api/question`);
        setQuestions(searchResultsResponse.data);
        setIsQuestionLoading(true);
      } catch (error) {
        console.log("error", error);
      }
    };

    fetchQuestions();
  }, []);

  // const handleSearch = useCallback(async () => {
  //   if (answerLoading) {
  //     return;
  //   }

  //   const question = (questionRef?.current as any)?.value ?? "";
  //   console.log("question", question);
  //   setAnswer("");
  //   setAnswerDone(false);

  //   if (!question) {
  //     setAnswerError("Please ask a question.");
  //     return;
  //   }
  //   if (props.files.length === 0) {
  //     setAnswerError("Please upload files before asking a question.");
  //     return;
  //   }

  //   setAnswerLoading(true);
  //   setAnswerError("");

  //   let results: FileChunk[] = [];

  //   try {
  //     const searchResultsResponse = await axios.post(
  //       "/api/search-file-chunks",
  //       {
  //         searchQuery: question,
  //         files: props.files,
  //         maxResults: 10,
  //       }
  //     );

  //     if (searchResultsResponse.status === 200) {
  //       results = searchResultsResponse.data.searchResults;
  //     } else {
  //       setAnswerError("Sorry, something went wrong!");
  //     }
  //   } catch (err: any) {
  //     console.log(err.message);
  //     setAnswerError("Sorry, something went wrong!");
  //   }

  //   setHasAskedQuestion(true);

  //   const res = await fetch("/api/get-answer-from-files", {
  //     method: "POST",
  //     headers: {
  //       "Content-Type": "application/json",
  //     },
  //     body: JSON.stringify({
  //       question,
  //       fileChunks: results,
  //     }),
  //   });
  //   const reader = res.body!.getReader();

  //   while (true) {
  //     const { done, value } = await reader.read();
  //     if (done) {
  //       setAnswerDone(true);
  //       answer && postQuestions(question, answer);
  //       break;
  //     }
  //     setAnswer((prev) => prev + new TextDecoder().decode(value));
  //   }

  //   setAnswerLoading(false);
  // }, [props.files, answerLoading]);

  const handleSearch = useCallback(async () => {
    if (answerLoading) {
      return;
    }

    const question = (questionRef?.current as any)?.value ?? "";
    console.log("question", question);
    setAnswer("");
    setAnswerDone(false);

    if (!question) {
      setAnswerError("Please ask a question.");
      return;
    }
    if (props.files.length === 0) {
      setAnswerError("Please upload files before asking a question.");
      return;
    }

    setAnswerLoading(true);
    setAnswerError("");

    let results: FileChunk[] = [];

    try {
      const searchResultsResponse = await axios.post(
        "/api/search-file-chunks",
        {
          searchQuery: question,
          files: props.files,
          maxResults: 10,
        }
      );

      if (searchResultsResponse.status === 200) {
        results = searchResultsResponse.data.searchResults;
      } else {
        setAnswerError("Sorry, something went wrong!");
      }
    } catch (err: any) {
      console.log(err.message);
      setAnswerError("Sorry, something went wrong!");
    }

    setHasAskedQuestion(true);

    const res = await fetch("/api/get-answer-from-files", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        question,
        fileChunks: results,
      }),
    });
    const reader = res.body!.getReader();

    let newAnswer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        setAnswerDone(true);
        answer && postQuestions(question, newAnswer || answer);
        break;
      }
      newAnswer += new TextDecoder().decode(value);
    }
    setAnswer(newAnswer);
    setAnswerLoading(false);
  }, [props.files, answerLoading]);

  const handleEnterInSearchBar = useCallback(
    async (event: React.SyntheticEvent) => {
      if ((event as any).key === "Enter") {
        await handleSearch();
      }
    },
    [handleSearch]
  );

  return (
    <>
      <div className="flex justify-between gap-20">
        {!isQuestionLoading ? (
          <LoadingText text="Loading questions..." />
        ) : (
          <div className="flex flex-col space-y-4 border border-gray-200 pl-4  bg-gray-50 overflow-y-scroll h-[400px]">
            {questions.length > 0 ? (
              questions?.map((item: any) => (
                <div
                  className="flex flex-col space-y-2 border-b cursor-auto"
                  key={item._id}
                  onClick={() => {
                    (questionRef?.current as any).value = item.question;
                    setIsQuestionPosted(item.answer);
                    handleSearch();
                  }}
                >
                  {item.question.substring(0, 30) + "..." ||
                    (questionRef?.current as any).value}
                </div>
              ))
            ) : (
              <div className="font-semibold">No questions yet</div>
            )}
          </div>
        )}
        <div>
          <div className="space-y-4 text-gray-800">
            <div className="mt-2">
              Ask a question based on the content of your files:
            </div>
            <div className="space-y-2">
              <input
                className="border rounded border-gray-200 w-full py-1 px-2"
                placeholder="e.g. What were the key takeaways from the Q1 planning meeting?"
                name="search"
                ref={questionRef}
                onKeyDown={handleEnterInSearchBar}
              />
              <div
                className="rounded-md bg-gray-50 py-1 px-4 w-max text-gray-500 hover:bg-gray-100 border border-gray-100 shadow cursor-pointer"
                onClick={handleSearch}
              >
                {answerLoading ? (
                  <LoadingText text="Answering question..." />
                ) : (
                  "Ask question"
                )}
              </div>
            </div>
            <div className="">
              {answerError && <div className="text-red-500">{answerError}</div>}
              <Transition
                show={hasAskedQuestion}
                enter="transition duration-600 ease-out"
                enterFrom="transform opacity-0"
                enterTo="transform opacity-100"
                leave="transition duration-125 ease-out"
                leaveFrom="transform opacity-100"
                leaveTo="transform opacity-0"
                className="mb-8"
              >
                {answer && (
                  <div className="">
                    <ReactMarkdown className="prose" linkTarget="_blank">
                      {`${answer}${answerDone ? "" : "  |"}`}
                    </ReactMarkdown>
                  </div>
                )}

                <Transition
                  show={
                    props.files.filter((file) =>
                      isFileNameInString(file.name, answer)
                    ).length > 0
                  }
                  enter="transition duration-600 ease-out"
                  enterFrom="transform opacity-0"
                  enterTo="transform opacity-100"
                  leave="transition duration-125 ease-out"
                  leaveFrom="transform opacity-100"
                  leaveTo="transform opacity-0"
                  className="mb-8"
                >
                  <FileViewerList
                    files={props.files.filter((file) =>
                      isFileNameInString(file.name, answer)
                    )}
                    title="Sources"
                    listExpanded={true}
                  />
                </Transition>
              </Transition>
            </div>
          </div>
        </div>
      </div>
      <div className="text-gray-800 font-semibold">Answered question:</div>
      <div className="flex m-auto flex-wrap">
        {isQuestionPosted && (
          <ReactMarkdown className="prose" linkTarget="_blank">
            {isQuestionPosted.toString()}
          </ReactMarkdown>
        )}
      </div>
    </>
  );
}

export default memo(FileQandAArea);
