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
import { SignInButton, UserButton, useUser } from "@clerk/nextjs";
import { type User } from "@prisma/client";
import type { AIResponse } from "./api/ai/route";

const queryClient = new QueryClient();

export default function Provider() {
  useEffect(() => {
    void fetch("/api/user/create");
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <Home />
    </QueryClientProvider>
  );
}

const minAge = 1;
const maxAge = 120;

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
  const textareaRef2 = useRef<HTMLTextAreaElement | null>(null);
  const textareaRef3 = useRef<HTMLTextAreaElement | null>(null);
  const textareaRef4 = useRef<HTMLTextAreaElement | null>(null);
  const [value, setValue] = useState("");
  const [value2, setValue2] = useState("");
  const [value3, setValue3] = useState("");
  const [value4, setValue4] = useState("");
  const [sex, setSex] = useState<string | null>(null);
  const [age, setAge] = useState<string | null>(null);
  const [diseases, setDiseases] = useState<AIResponse | null>(null);
  const [phoneNumbers, setPhoneNumbers] = useState<string[] | null>(null);

  const { data, refetch, isFetching } = useQuery({
    queryKey: [
      "symptoms",
      JSON.stringify({
        sex,
        age,
        symptoms: value,
        "recent injury/trauma to the area": value4,
        "lifestyle/medications": value3,
        "past medical issues": value2,
      }),
    ],
    queryFn: async ({ queryKey }) => {
      setListView(true);
      const json = (await fetch(`/api/ai?json=${queryKey[1]}`)
        .then((response) => response.json())
        .then((token: string) => {
          return fetch(
            `https://web-production-a42cd.up.railway.app/query?user_info=${queryKey[1]}`,
            {
              headers: {
                "X-SymptoAI-Auth": token,
              },
            }
          ).then((response) => response.json());
        })) as AIResponse;
      setDiseases(json);
      void (async () => {
        Promise.all(
          Object.keys(json).map((diseaseName) => {
            return fetch(
              `/api/yelp?find_desc=${json[diseaseName].treatment}&cflt=${json[diseaseName].metadata[1]}&path=search`
            )
              .then((response) => response.text())
              .then((text) => {
                return text.match(/\/biz\/.*?(?=[">])/)![0];
              })
              .then((href) => {
                const url = new URL(href, "https://www.yelp.com/search");
                return fetch(
                  `/api/yelp${url.search}${
                    url.search ? "&" : "?"
                  }path=${url.pathname.slice(1)}`
                )
                  .then((response) => response.text())
                  .then((text) => {
                    return (text.match(/\(\d{3}\) \d{3}-\d{4}/) || [""])[0];
                  });
              });
          })
        ).then((phoneNumbers) => {
          setPhoneNumbers(phoneNumbers);
        });
      })();
      return json;
    },
    enabled: false,
  });

  const send = async () => {
    setValue(textareaRef.current!.value);
    setValue2(textareaRef2.current!.value);
    setValue3(textareaRef3.current!.value);
    setValue4(textareaRef4.current!.value);
  };

  useEffect(() => {
    if (value && value2 && value3 && value4 && sex && age) void refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, value2, value3, value4]);

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
  const { isSignedIn } = useUser();

  const { data: userDB } = useQuery({
    queryKey: ["user", diseases],
    queryFn: async () => {
      return (await fetch("/api/user/get").then((response) =>
        response.json()
      )) as User;
    },
    enabled: !!isSignedIn,
  });

  return (
    <main
      className={`flex flex-col items-center justify-between ${
        listView ? "p-2 sm:p-4 md:p-12 lg:p-18" : "p-4 sm:p-8 md:p-16 lg:p-24"
      } min-h-screen`}
      ref={animationParent}
    >
      <div
        className={`absolute top-4 ${
          listView ? "left-4" : "right-4"
        } flex flex-nowrap justify-center items-center gap-x-4`}
      >
        {isSignedIn ? (
          <div className="flex flex-wrap justify-center items-center gap-x-2 bg-gray-400/20 p-1 pr-2 rounded-lg hover:bg-gray-200/20 hover:transition-colors">
            <img className="h-[40px]" alt="Tokens" src="/coin.png" />
            <p className="mr-1">
              {userDB ? String(userDB.tokens + userDB.freeTokens) : "N/A"}
            </p>
            <div
              className="h-full w-5 align-middle bg-yellow-200 p-1 rounded-sm hover:bg-yellow-100 hover:transition-colors cursor-pointer"
              onClick={() => {
                fetch("/api/stripe/create")
                  .then((response) => response.json())
                  .then((json) => {
                    window.open(json.url as string, "_blank");
                  });
              }}
              dangerouslySetInnerHTML={{
                __html: `<svg xmlns="http://www.w3.org/2000/svg" fill="black" viewBox="0 0 448 512"><!--! Font Awesome Pro 6.4.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --><path d="M256 80c0-17.7-14.3-32-32-32s-32 14.3-32 32V224H48c-17.7 0-32 14.3-32 32s14.3 32 32 32H192V432c0 17.7 14.3 32 32 32s32-14.3 32-32V288H400c17.7 0 32-14.3 32-32s-14.3-32-32-32H256V80z"/></svg>`,
              }}
            />
          </div>
        ) : null}
        {listView ? null : isSignedIn ? (
          <UserButton />
        ) : (
          <div className="bg-gray-400/20 p-1 px-3 rounded-lg hover:bg-gray-200/20 hover:transition-colors cursor-pointer">
            <SignInButton />
          </div>
        )}
      </div>

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
        <div className="w-full mb-4 flex justify-end items-center cursor-pointer absolute right-4 top-4">
          <div
            onClick={() => {
              setListView(false);
              setSex(null);
              setAge(null);
              setDiseases(null);
              if (textareaRef.current) textareaRef.current.value = "";
            }}
            dangerouslySetInnerHTML={{
              __html: `<svg style="width: 18px;" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" fill="white"><!--! Font Awesome Pro 6.4.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --><path d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z"/></svg>`,
            }}
          ></div>
        </div>
      ) : null}
      {diseases || isFetching ? null : (
        <div className="w-full relative mt-4">
          <div className="w-full relative">
            {listView ? (
              <label htmlFor="SymptomsInput" className="text-sm">
                Symptoms
              </label>
            ) : null}
            <textarea
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

          {listView && (
            <>
              <div className="w-full relative mt-4">
                <label htmlFor="MedicalHistoryInput" className="text-sm">
                  Medical History
                </label>
                <textarea
                  id="MedicalHistoryInput"
                  placeholder="Enter your past medical history..."
                  ref={textareaRef2}
                  className={textareaClassName}
                ></textarea>
                <Microphone id="MedicalHistoryInput" />
              </div>
              <div className="w-full relative mt-4">
                <label htmlFor="InjuryTraumaInput" className="text-sm">
                  Injury/Trauma to Area
                </label>
                <textarea
                  id="InjuryTraumaInput"
                  placeholder="Enter past or recent injury/trauma to the area..."
                  ref={textareaRef4}
                  className={textareaClassName}
                ></textarea>
                <Microphone id="InjuryTraumaInput" />
              </div>
              <div className="w-full relative mt-4">
                <label htmlFor="MedicationsInput" className="text-sm">
                  Medications/Lifestyle Factors
                </label>
                <textarea
                  id="MedicationsInput"
                  placeholder="Enter your medications and lifestyle factors..."
                  className={textareaClassName}
                  ref={textareaRef3}
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
                      {[...Array(maxAge - minAge + 1).fill(0)]
                        .map((_, index) => index + minAge)
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
      )}

      {listView && diseases ? (
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {Object.entries(diseases).map((result, index) => {
            return (
              <div
                key={result[0]}
                className="rounded-lg bg-slate-950 p-4 pb-16 relative"
              >
                <h2 className="text-lg">{result[0]}</h2>
                <p className="text-sm">{result[1].summary}</p>
                {phoneNumbers && !phoneNumbers[index] ? null : (
                  <a href={`tel:${phoneNumbers ? phoneNumbers[index] : ""}`}>
                    <div className="text-sm mt-2 flex flex-row flex-nowrap gap-x-2 absolute bottom-4 bg-blue-500 rounded-lg p-1 px-2">
                      <img
                        width={14}
                        height={14}
                        src="/phone.svg"
                        alt="Telephone"
                      />
                      Call a doctor
                    </div>
                  </a>
                )}
              </div>
            );
          })}
        </div>
      ) : listView && isFetching ? (
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map((index) => {
            return (
              <div key={index} className="rounded-lg bg-slate-950 p-4">
                <div className="rounded-lg bg-slate-400/40 w-24 h-4 animate-pulse"></div>
              </div>
            );
          })}
        </div>
      ) : null}

      {listView && (diseases || isFetching) ? (
        <Button
          onClick={() => {
            setDiseases(null);
            void refetch();
          }}
          className="w-full sm:w-max mt-4"
        >
          {!diseases && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Refetch
        </Button>
      ) : null}
    </main>
  );
}
