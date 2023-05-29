"use client";

import React from "react";

export default function Diseases({
  searchParams,
}: {
  searchParams: {
    title: string;
    summary: string;
    probability: string;
    treatment: string;
    doctorName: string;
    doctorNumber: string;
  };
}) {
  function getImageSrc(probability: string) {
    let imageSrc = "";
    switch (probability) {
      case "Very High":
        imageSrc = "/very_high.svg";
        break;
      case "High":
        imageSrc = "/high.svg";
        break;
      case "Moderate":
        imageSrc = "/moderate.svg";
        break;
      case "Low":
        imageSrc = "/low.svg";
        break;
      case "Very Low":
        imageSrc = "/very_low.svg";
      default:
        imageSrc = "/very_low.svg";
        break;
    }
    return imageSrc;
  }

  return (
    <div className="container grid grid-cols-2 gap-8 mt-8">
      <div className="text-center">
        <h1 className="text-5xl font-bold break-words">{searchParams.title}</h1>
        <div className="w-max mx-auto">
          <div className="mt-10 w-full grid-rows-3">
            <h4 className="text-2xl text-left font-semibold mb-2">
              Probability
            </h4>
            <img
              alt="Probability Graph"
              src={getImageSrc(searchParams.probability)}
            ></img>
            <p className="text-sm text-left ml-[50px]">
              {searchParams.probability}
            </p>
          </div>
        </div>
      </div>

      <div>
        {searchParams.doctorName && searchParams.doctorNumber ? (
          <div>
            <div className="font-bold text-2xl section-title mb-4">
              Contacts
            </div>
            <div className="text-xl mt-2 flex flex-row flex-nowrap gap-x-2">
              <img width={20} height={20} src="/phone.svg" alt="Telephone" />
              <p className="text-slate-100">
                {searchParams.doctorNumber ? searchParams.doctorNumber : "N/A"}
              </p>
            </div>
            <div className="text-xl mt-2 flex flex-row flex-nowrap gap-x-2">
              <img width={20} height={20} src="/user.svg" alt="User" />
              <p className="text-slate-100">Dr. Jane Doe, MD</p>
            </div>
          </div>
        ) : null}

        <div className="font-bold text-2xl section-title mt-4 mb-4">About</div>
        <p className="text-slate-100">{searchParams.summary}</p>

        <div className="font-bold text-2xl section-title mt-4 mb-4">
          Treatment
        </div>
        <ul className="list-disc pl-4">
          {searchParams.treatment.split(",").map((treatment, index) => {
            return (
              <li key={index} className="p-1">
                {treatment}
              </li>
            );
          })}
        </ul>
      </div>

      <div className="w-full mb-4 flex justify-end items-center cursor-pointer absolute right-4 top-4">
        <div
          onClick={() => {
            const url = new URL(location.href);
            url.search = "?back=true";
            url.pathname = "/";
            location.href = url.toString();
          }}
          dangerouslySetInnerHTML={{
            __html: `<svg style="width: 18px;" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" fill="white"><!--! Font Awesome Pro 6.4.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --><path d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z"/></svg>`,
          }}
        ></div>
      </div>

      <style jsx>{`
        .horizontal-items {
          display: flex;
        }
        .container {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
        }

        .section-title {
          @apply text-lg;
        }

        .text-slate-100 {
          @apply text-slate-100;
        }
      `}</style>
    </div>
  );
}
