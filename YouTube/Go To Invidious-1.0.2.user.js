// ==UserScript==
// @name         Go To Invidious
// @namespace    http://tampermonkey.net/
// @version      1.0.2
// @description  Create a button to redirect to Invidious selft hosted player
// @author       Tristan_JVShow
// @match        https://www.youtube.com/watch?v=*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=youtube.com
// @grant        GM_registerMenuCommand
// @grant        GM_setValue
// @grant        GM_getValue
// @run-at       document-end
// ==/UserScript==

(function() {
    'use strict';

    function addInvidiousButton() {
        const currentUrl = window.location.href;
        const re = /https:\/\/www\.youtube\.com\/watch\?v=(.+)(?:&.+)?/
        const parent = document.getElementById("actions").getElementsByClassName("style-scope")[1].getElementsByClassName("style-scope")[0];

        if (document.getElementById("goToInvidious") !== null) {
            return;
        }

        // console.log("***** Current URL: " + currentUrl);

        var invidiousButton = document.createElement("div");
        invidiousButton.style.width = "80px";
        invidiousButton.style.height = "35px";
        invidiousButton.style.backgroundColor = "#212121";
        invidiousButton.style.color = "white";
        invidiousButton.style.borderRadius = '30px';
        invidiousButton.style.cursor = 'pointer';
        invidiousButton.style.textAlign = 'center';
        invidiousButton.style.verticalAlign = 'middle';
        invidiousButton.style.fontWeight = 'bold';
        invidiousButton.style.display = "flex";
        invidiousButton.style.marginLeft = "8px";
        invidiousButton.classList.add("yt-spec-button-shape-next");
        invidiousButton.classList.add("yt-spec-button-shape-next--tonal");
        invidiousButton.classList.add("yt-spec-button-shape-next--mono");
        invidiousButton.classList.add("yt-spec-button-shape-next--size-m");
        invidiousButton.classList.add("yt-spec-button-shape-next--icon-leading");
        invidiousButton.innerHTML = window.trustedTypes.defaultPolicy.createHTML("Invidious");
        invidiousButton.setAttribute("id", "goToInvidious");

        function openInvidious() {
            const videoMatch = currentUrl.match(re);
            const videoId = videoMatch[1];
            console.log("***** Video ID: " + videoId);
            const url = "http://homelab.intranet.blackwizard.fr:3000/watch?v=" + videoId;
            console.log("***** Open: " + url);
            window.open(url, '_self');
        }

        invidiousButton.addEventListener('click', openInvidious);
        invidiousButton.addEventListener('mouseover', function () {
            invidiousButton.style.backgroundColor = '#3f3f3f';
        });
        invidiousButton.addEventListener('mouseout', function () {
            invidiousButton.style.backgroundColor = '#212121';
        });

        parent.appendChild(invidiousButton);
    }

    function updateInvidiousButton (currentUrl) {
        const re = /https:\/\/www\.youtube\.com\/watch\?v=(.+)(?:&.+)?/

        if (document.getElementById("goToInvidious") === null) {
            console.log("***** Can't find the button");
            return;
        }

        var button = document.getElementById("goToInvidious");

        function openInvidious() {
            const videoMatch = currentUrl.match(re);
            const videoId = videoMatch[1];
            console.log("***** Video ID: " + videoId);
            const url = "http://homelab.intranet.blackwizard.fr:3000/watch?v=" + videoId;
            console.log("***** Open: " + url);
            window.open(url, '_self');
        }

        // Replace button with itself to remove event listener
        button.replaceWith(button.cloneNode(true));

        // Select the cloned button
        var newButton = document.getElementById("goToInvidious");

        newButton.addEventListener('click', openInvidious);
        newButton.addEventListener('mouseover', function () {
            newButton.style.backgroundColor = '#3f3f3f';
        });
        newButton.addEventListener('mouseout', function () {
            newButton.style.backgroundColor = '#212121';
        });
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


    window.addEventListener('load', function() {
        if (window.trustedTypes && window.trustedTypes.createPolicy) {
            window.trustedTypes.createPolicy('default', {
                createHTML: (string, sink) => string
            });
        }

        console.log("***********************");
        console.log("*** Go To Invidious ***");
        console.log("***********************");

        var currentUrl = window.location.href;

        waitForElementToExist('#actions').then(element => {
            // console.log('***** The element exists', element);
            addInvidiousButton();
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

        window.navigation.addEventListener("navigate", (event) => {
            const newLocation = event.destination.url;

            if (newLocation != currentUrl) {
                // console.log('location changed! ; ' + currentUrl + ' => ' + newLocation);
                updateInvidiousButton(newLocation);
                currentUrl = newLocation;
            }
        })
    });
})();