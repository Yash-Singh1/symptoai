"use client";

import { useEffect, useRef, useState } from "react";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import {
  QueryClientProvider,
  QueryClient,
  useQuery,
} from "@tanstack/react-query";

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

function Home() {
  const [listView, setListView] = useState(false);
  const [running, setRunning] = useState(false);
  const [animationParent] = useAutoAnimate();
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [value, setValue] = useState("");

  const { data, refetch } = useQuery({
    queryKey: ["symptoms", value],
    queryFn: async ({ queryKey }) => {
      setListView(true);
      const json = await fetch(
        `https://symptoai.vercel.app/query?sentence=${queryKey[1]}`
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

    recognition.onresult = (event) => {
      textareaRef.current!.value +=
        event.results[event.resultIndex][0].transcript;
    };

    return () => {
      recognition!.onresult = () => {};
    };
  });

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
          <textarea
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            id="SymptomsInput"
            ref={textareaRef}
            placeholder="Enter your symptoms..."
            className="flex h-20 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          ></textarea>
          <div className="absolute bottom-3 right-3 flex flex-row gap-x-4 items-center">
            {recognition ? (
              running ? (
                <div
                  className="w-3 h-3 absolute right-8 cursor-pointer bg-red-900 p-0 record-pulse box-content border-0"
                  onClick={() => {
                    recognition!.stop();
                    setRunning(false);
                  }}
                ></div>
              ) : (
                <div
                  className="w-3 cursor-pointer"
                  onClick={() => {
                    recognition!.start();
                    setRunning(true);
                  }}
                  dangerouslySetInnerHTML={{
                    __html: `<svg xmlns="http://www.w3.org/2000/svg" fill="white" viewBox="0 0 384 512"><!--! Font Awesome Pro 6.4.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --><path d="M192 0C139 0 96 43 96 96V256c0 53 43 96 96 96s96-43 96-96V96c0-53-43-96-96-96zM64 216c0-13.3-10.7-24-24-24s-24 10.7-24 24v40c0 89.1 66.2 162.7 152 174.4V464H120c-13.3 0-24 10.7-24 24s10.7 24 24 24h72 72c13.3 0 24-10.7 24-24s-10.7-24-24-24H216V430.4c85.8-11.7 152-85.3 152-174.4V216c0-13.3-10.7-24-24-24s-24 10.7-24 24v40c0 70.7-57.3 128-128 128s-128-57.3-128-128V216z"/></svg>`,
                  }}
                ></div>
              )
            ) : null}
            <div
              className="w-4 cursor-pointer"
              onClick={send}
              dangerouslySetInnerHTML={{
                __html: `<svg xmlns="http://www.w3.org/2000/svg" fill="white" viewBox="0 0 512 512"><!--! Font Awesome Pro 6.4.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --><path d="M498.1 5.6c10.1 7 15.4 19.1 13.5 31.2l-64 416c-1.5 9.7-7.4 18.2-16 23s-18.9 5.4-28 1.6L284 427.7l-68.5 74.1c-8.9 9.7-22.9 12.9-35.2 8.1S160 493.2 160 480V396.4c0-4 1.5-7.8 4.2-10.7L331.8 202.8c5.8-6.3 5.6-16-.4-22s-15.7-6.4-22-.7L106 360.8 17.7 316.6C7.1 311.3 .3 300.7 0 288.9s5.9-22.8 16.1-28.7l448-256c10.7-6.1 23.9-5.5 34 1.4z"/></svg>`,
              }}
            ></div>
          </div>
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
      </div>
    </main>
  );
}
