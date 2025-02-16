// ==UserScript==
// @name         Invidious HomePage
// @namespace    http://tampermonkey.net/
// @version      1.0.1
// @description  Add Invidious link under Youtube title on home page
// @author       Tristan_JVShow
// @match        https://www.youtube.com/
// @icon         https://www.google.com/s2/favicons?sz=64&domain=youtube.com
// @grant        GM_registerMenuCommand
// @grant        GM_setValue
// @grant        GM_getValue
// ==/UserScript==

(function() {
    'use strict';

    function addInvidiousLink() {
        const links = document.getElementsByClassName("focus-on-expand");

        for (const element of links) {
            const re = /https:\/\/www\.youtube\.com\/watch\?v=(.+)(?:&.+)?/

            var link = element.href;
            var title = element.parentElement;

            if (title.querySelector('.go-to-invidious')) {
                continue;
            }

            const videoMatch = link.match(re);
            const videoId = videoMatch[1];

            var div = document.createElement("a");
            div.style.color = "white";
            div.style.cursor = 'pointer';
            div.style.fontWeight = 'bold';
            div.style.color = "cornflowerblue";
            div.classList.add("go-to-invidious");
            div.innerHTML = "Watch on Invidious";
            div.setAttribute("id", "goToInvidious");
            div.href = "http://homelab.intranet.blackwizard.fr:3000/watch?v=" + videoId;
            div.target = "_blank";

            title.appendChild(div);
        }
    }

    function waitForElementToExist(selector) {
        return new Promise(resolve => {
            if (document.querySelector(selector)) {
                return resolve(document.querySelector(selector));
            }

            const observer = new MutationObserver(() => {
                if (document.querySelector(selector)) {
                    resolve(document.querySelector(selector));
                    observer.disconnect();
                }
            });

            observer.observe(document.body, {
                subtree: true,
                childList: true,
            });
        });
    }

    const observer = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
            if (mutation.type === 'childList' && mutation.target.tagName === 'DIV' && mutation.target.id === 'contents') {
                addInvidiousLink();
            }
        }
    });

    window.addEventListener('load', function() {
        if (window.trustedTypes && window.trustedTypes.createPolicy) {
            window.trustedTypes.createPolicy('default', {
                createHTML: (string, sink) => string
            });
        }

        waitForElementToExist('.focus-on-expand').then(element => {
            addInvidiousLink();
        });

        const menu_command_id_1 = GM_registerMenuCommand("Set Invidious URL", () => {
            var url = GM_getValue("invidiousUrl", null);

            if (url == null) {
                url = "http://invidious.local.net:3000";
            }

            let invidiousUrl = prompt("Please enter your Invidious URL", url);

            if (invidiousUrl != null) {
                GM_setValue("invidiousUrl", invidiousUrl);
            }
        }, {
            accessKey: "s",
            autoClose: true
        });

        const menu_command_id_2 = GM_registerMenuCommand("Show Invidious URL", () => {
            const url = GM_getValue("invidiousUrl", "notSet");
            alert(url);
        }, {
            accessKey: "g",
            autoClose: true
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    });
})();