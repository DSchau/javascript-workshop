import React, { Component } from "react";
import qs from "query-string";

import "prismjs";
import loadLanguages from "prismjs/components/index.js";
import "prismjs/plugins/keep-markup/prism-keep-markup.js";
import "prismjs/plugins/normalize-whitespace/prism-normalize-whitespace.js";
import "prismjs/plugins/unescaped-markup/prism-unescaped-markup.js";

import "reveal.js/css/reveal.css";
import "@objectpartners/revealjs-theme";
import "prismjs/themes/prism-okaidia.css";
import "prismjs/plugins/unescaped-markup/prism-unescaped-markup.css";

import "./slide-deck.css";

export class SlideDeck extends Component {
  componentDidMount() {
    const params = qs.parse(location.search);
    const print = typeof params["print-pdf"] !== "undefined";
    loadLanguages(["groovy", "json", "jsx", "flow", "typescript"]); // why groovy? Exactly.
    require.ensure(
      [
        "reveal.js",
        "reveal.js/lib/js/classList.js",
        "reveal.js/lib/js/head.min.js",
        "reveal.js/lib/js/html5shiv.js",
        "reveal.js/css/print/pdf.css"
      ],
      () => {
        const Reveal = require("reveal.js");
        require("reveal.js/lib/js/classList.js");
        require("reveal.js/lib/js/head.min.js");
        require("reveal.js/lib/js/html5shiv.js");

        if (print) {
          document.documentElement.classList.add("print-pdf");
          require("reveal.js/css/print/pdf.css");
        }

        window.Reveal = Reveal;

        Reveal.initialize({
          history: true,
          margin: 0.1,
          dependencies: [
            {
              async: true,
              src: require("reveal.js/plugin/zoom-js/zoom.js")
            },
            {
              async: true,
              src: require("reveal.js/plugin/markdown/marked.js")
            },
            {
              async: true,
              src: require("reveal.js/plugin/notes/notes.js")
            }
          ]
        });
      }
    );
  }

  getSectionProps(html) {
    const section = html.match(/<section[^>]+/);
    if (!section) {
      return {};
    }

    const props = section
      .pop()
      .replace(/<section\s/, "")
      .split(/([\w-]+)="([^"]+)"/)
      .filter(part => part && part.length > 0);

    return props.reduce((merged, part, index) => {
      if (part % 1 === 0) {
        merged[part] = "";
      } else if (props[index - 1]) {
        merged[props[index - 1]] = part;
      }
      return merged;
    }, {});
  }

  render() {
    const { slides } = this.props;
    const { PRESENTATION_DATE: date } = process.env;
    return (
      <div className="reveal">
        <div className="slides">
          <section data-state="title">
            <h1 style={{ whiteSpace: "nowrap" }}>JavaScript Intro.</h1>
            <h2>{date}</h2>
          </section>
          {slides.map((deck, deckIndex) => {
            return (
              <section key={deckIndex}>
                {deck.map((html, slideIndex) => {
                  const key = `${deckIndex}-${slideIndex}`;
                  if (html.default) {
                    const Slide = html.default;
                    return (
                      <section key={key}>
                        <Slide />
                      </section>
                    );
                  }
                  const sectionProps = this.getSectionProps(html);
                  return (
                    <section
                      key={key}
                      {...sectionProps}
                      dangerouslySetInnerHTML={{ __html: html }} // #yolo
                    />
                  );
                })}
              </section>
            );
          })}
          <section data-background="https://media.giphy.com/media/eTVG7eVNnud8Y/giphy.gif">
            <h2>Questions</h2>
          </section>
          <section data-state="title">
            <h1>Thank you!</h1>
            <h3>Follow us! @objectpartners</h3>
          </section>
        </div>
      </div>
    );
  }
}
