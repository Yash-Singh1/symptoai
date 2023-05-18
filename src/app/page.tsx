"use client";

import { useEffect, useRef, useState } from "react";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import {
  QueryClientProvider,
  QueryClient,
  useQuery,
} from "@tanstack/react-query";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

const queryClient = new QueryClient();

export default function Provider() {
  return (
    <QueryClientProvider client={queryClient}>
      <Home />
    </QueryClientProvider>
  );
}

declare global {
  interface Window {
    mozSpeechRecognition?: SpeechRecognitionStatic;
  }
}

let recognition: SpeechRecognition | undefined;

const textareaClassName =
  "flex h-20 w-full rounded-md mt-2 border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

function Home() {
  const [listView, setListView] = useState(false);
  const [running, setRunning] = useState<false | string>(false);
  const [animationParent] = useAutoAnimate();
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [value, setValue] = useState("");

  const { data, refetch, isFetching } = useQuery({
    queryKey: ["symptoms", value],
    queryFn: async ({ queryKey }) => {
      setListView(true);
      const json = await fetch(
        `https://symptoai.vercel.app/query?user_info=${queryKey[1]}`
      ).then((response) => response.json());
      const diseaseOutput = [];
      for (const disease in json["matches"]) {
        diseaseOutput.push(
          json["matches"][disease]["metadata"]["metadata_key"]
        );
      }
      return diseaseOutput as string[];
    },
    enabled: false,
  });

  const send = async () => {
    setValue(textareaRef.current!.value);
  };

  useEffect(() => {
    if (value) void refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  useEffect(() => {
    let SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition ||
      window.mozSpeechRecognition;

    try {
      recognition = new SpeechRecognition();

      recognition.lang = "en-US";
      recognition.maxAlternatives = 1;
      recognition.interimResults = false;
      recognition.continuous = true;

      recognition.onerror = console.error;
    } catch {}

    if (!recognition) return;

    return () => {
      recognition!.onresult = () => {};
    };
  });

  function Microphone({ id }: { id: string }) {
    return (
      <div className="absolute bottom-3 right-3 flex flex-row items-center">
        {recognition ? (
          running === id ? (
            <div
              className="w-3 h-3 cursor-pointer bg-red-900 p-0 record-pulse box-content border-0"
              onClick={() => {
                recognition!.stop();
                setRunning(false);
              }}
            ></div>
          ) : (
            <div
              className={`w-3 ${
                running ? "cursor-not-allowed" : "cursor-pointer"
              }`}
              aria-disabled={!!running}
              onClick={() => {
                if (running) {
                  return;
                }
                recognition!.onresult = (event) => {
                  (document.getElementById(id) as HTMLTextAreaElement).value +=
                    event.results[event.resultIndex][0].transcript;
                };
                recognition!.start();
                setRunning(id);
              }}
              dangerouslySetInnerHTML={{
                __html: `<svg xmlns="http://www.w3.org/2000/svg" fill="white" viewBox="0 0 384 512"><!--! Font Awesome Pro 6.4.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --><path d="M192 0C139 0 96 43 96 96V256c0 53 43 96 96 96s96-43 96-96V96c0-53-43-96-96-96zM64 216c0-13.3-10.7-24-24-24s-24 10.7-24 24v40c0 89.1 66.2 162.7 152 174.4V464H120c-13.3 0-24 10.7-24 24s10.7 24 24 24h72 72c13.3 0 24-10.7 24-24s-10.7-24-24-24H216V430.4c85.8-11.7 152-85.3 152-174.4V216c0-13.3-10.7-24-24-24s-24 10.7-24 24v40c0 70.7-57.3 128-128 128s-128-57.3-128-128V216z"/></svg>`,
              }}
            ></div>
          )
        ) : null}
      </div>
    );
  }

  const [sex, setSex] = useState<string | null>(null);
  const [age, setAge] = useState<string | null>(null);

  return (
    <main
      className="flex flex-col items-center justify-between p-4 sm:p-8 md:p-16 lg:p-24 min-h-screen"
      ref={animationParent}
    >
      {listView ? null : (
        <div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-wide text-center mb-4">
            <span className="text-blue-400">Sympto</span>
            <span className="text-blue-200">AI</span>
          </h1>
          <div className="grid grid-rows-3 sm:grid-rows-1 sm:grid-cols-3 mb-8">
            <div className="grid grid-rows-[1fr_max-content] h-min">
              <img
                src="/symptom.png"
                alt="Identify symptoms"
                className="self-center"
              />
              <p className="h-max text-center">Identify your symptoms</p>
            </div>
            <div className="grid grid-rows-[1fr_max-content]">
              <img
                src="/typing.png"
                alt="Input symptoms"
                className="self-center"
              />
              <p className="h-max text-center">Input your symptoms</p>
            </div>
            <div className="grid grid-rows-[1fr_max-content]">
              <img
                src="/results.png"
                alt="Receive results"
                className="self-center"
              />
              <p className="h-max text-center">Receive and act upon results</p>
            </div>
          </div>
        </div>
      )}
      {listView ? (
        <div
          className="w-full mb-4 flex justify-end items-center cursor-pointer absolute right-4 top-4"
          onClick={() => {
            setListView(false);
            textareaRef.current!.value = "";
          }}
          dangerouslySetInnerHTML={{
            __html: `<svg style="width: 18px;" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" fill="white"><!--! Font Awesome Pro 6.4.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --><path d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z"/></svg>`,
          }}
        ></div>
      ) : null}
      <div className="w-full relative">
        <div className="w-full relative">
          {listView ? (
            <label htmlFor="SymptomsInput" className="text-sm">
              Symptoms
            </label>
          ) : null}
          <textarea
            // onKeyDown={(e) => {
            //   if (e.key === "Enter" && !e.shiftKey) {
            //     e.preventDefault();
            //     send();
            //   }
            // }}
            onChange={() => {
              setListView(true);
            }}
            id="SymptomsInput"
            ref={textareaRef}
            placeholder="Enter your symptoms..."
            className={textareaClassName.replace(
              listView ? "" : " mt-2 ",
              "  "
            )}
          ></textarea>
          <Microphone id="SymptomsInput" />
        </div>
        {listView && data ? (
          <div className="mt-4 grid grid-cols-3 gap-4">
            {data.map((result) => {
              return (
                <div key={result} className="rounded-lg bg-slate-950 p-4">
                  <h2 className="text-lg">{result}</h2>
                </div>
              );
            })}
          </div>
        ) : listView ? (
          <div className="mt-4 grid grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5].map((index) => {
              return (
                <div key={index} className="rounded-lg bg-slate-950 p-4">
                  <div className="rounded-lg bg-slate-400/40 w-1/2 h-4 animate-pulse"></div>
                </div>
              );
            })}
          </div>
        ) : null}

        {listView && (
          <>
            <div className="w-full relative mt-4">
              <label htmlFor="MedicalHistoryInput" className="text-sm">
                Medical History
              </label>
              <textarea
                id="MedicalHistoryInput"
                placeholder="Enter your past medical history..."
                className={textareaClassName}
              ></textarea>
              <Microphone id="MedicalHistoryInput" />
            </div>
            <div className="w-full relative mt-4">
              <label htmlFor="MedicationsInput" className="text-sm">
                Medications/Lifestyle Factors
              </label>
              <textarea
                id="MedicationsInput"
                placeholder="Enter your medications and lifestyle factors..."
                className={textareaClassName}
              ></textarea>
              <Microphone id="MedicationsInput" />
            </div>
            <div className="mt-4">
              <label className="text-sm mb-2 block">Sex</label>
              <Select onValueChange={(value) => setSex(value)}>
                <SelectTrigger className="w-full md:w-[200px]">
                  <SelectValue placeholder="Sex" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="intersex">Intersex</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                  <SelectItem value="private">Prefer not to say</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="mt-4">
              <label className="text-sm mb-2 block">Age</label>
              <Select onValueChange={(value) => setAge(value)}>
                <SelectTrigger className="w-full md:w-[200px]">
                  <SelectValue placeholder="Age" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {[...Array(100 - 18 + 1).fill(0)]
                      .map((_, index) => index + 18)
                      .map((age) => {
                        return (
                          <SelectItem value={age.toString()} key={age}>
                            {age}
                          </SelectItem>
                        );
                      })}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div className="mt-4">
              <Button onClick={() => void send()} className="w-full sm:w-max">
                {isFetching && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Calculate Possibilities
              </Button>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
