const url = window.location.href;

let id;
let index;

if (url[23] === "c") {
    const data = url.slice(31, url.length);
    const dataArray = data.split(/[\/\?]/);
    id = dataArray[0];
    index = dataArray[2];
} else {
    const data = url.slice(42, url.length);
    const dataArray = data.split(/[\/\?]/);
    id = dataArray[0];
    index = dataArray[1];
}

const requestURL = `https://codeforces.com/api/contest.standings?contestId=${id}&from=1&count=1`;

fetchData();

function buildTagHtml(tag) {
    return `
            <div class="roundbox tag-toggle hidden" style="margin:2px; padding:0 3px 2px 3px; background-color:#f0f0f0;float:left;">
                <div class="roundbox-lt">&nbsp;</div>
                <div class="roundbox-rt">&nbsp;</div>
                <div class="roundbox-lb">&nbsp;</div>
                <div class="roundbox-rb">&nbsp;</div>
                <span class="tag-box" style="font-size:1.2rem;" title="Difficulty">
                    ${tag}
                </span>
            </div>
        `;
}

function buildTagsHtml(tags) {
    if (!tags || !tags.length) {
        return "";
    }

    return tags.map(buildTagHtml).join("");
}

function buildBoxHtml(rating, tags) {
    const hasTags = Boolean(tags && tags.length);

    if (rating === -1) {
        return `
                  <div class="roundbox sidebox cfgr-container" style="">
                    <div class="roundbox-lt">&nbsp;</div>
                    <div class="roundbox-rt">&nbsp;</div>
                    <div class="caption titled">→ CF GetRating
                        <div class="top-links"></div>
                    </div>
                    <div>
                        <div style="margin:1em;font-size:0.8em;color: red;">
                            Codeforces API Error.
                        </div>
                    </div>
                    <div style="text-align:center;margin-bottom:15px">
                        <a href="https://codeforces.com/contest/${id}/standings" target="_blank"><button>Contest Standings</button></a>
                    </div>
                </div>
            `;
    }

    const ratingContent =
        rating == null
            ? `
            <div style="margin-bottom: 5px; font-size:0.8em;color: red;">
                Rating not available for this question.
            </div>
        `
            : `
            <div class="roundbox" style="margin:2px; padding:0 3px 2px 3px; background-color:#f0f0f0;float:left;">
                <div class="roundbox-lt">&nbsp;</div>
                <div class="roundbox-rt">&nbsp;</div>
                <div class="roundbox-lb">&nbsp;</div>
                <div class="roundbox-rb">&nbsp;</div>
                <span class="tag-box" style="font-size:1.2rem;" title="Difficulty">
                    *${rating}
                </span>
            </div>
        `;

    return `
                <div class="roundbox sidebox cfgr-container" style="">
                    <div class="roundbox-lt">&nbsp;</div>
                    <div class="roundbox-rt">&nbsp;</div>
                    <div class="caption titled">→ CF GetRating
                        <div class="top-links"></div>
                    </div>
                    <div style="padding: 0.5em;">
                        ${ratingContent}
                        ${buildTagsHtml(tags)}
                        <div style="clear:both;text-align:right;font-size:1.1rem;"></div>
                    </div>
                    ${hasTags
            ? `
                    <div style="text-align:center;">
                        <button id="cfgr-toggle-tags" style="margin-bottom:3px; width: 50%;">Show Tags</button>
                    </div>`
            : ""
        }
                    <div style="text-align:center;">
                        <a href="https://codeforces.com/contest/${id}/standings" target="_blank"><button style="margin-bottom:15px; margin-top: 3px; width: 50%;">Contest Standings</button></a>
                    </div>
                </div>
            `;
}

function attachToggleHandler(container) {
    const toggleButton = container.querySelector("#cfgr-toggle-tags");
    if (!toggleButton) {
        return;
    }

    toggleButton.addEventListener("click", () => {
        const tagNodes = container.querySelectorAll(".tag-toggle");
        if (!tagNodes.length) {
            return;
        }

        const shouldShow = Array.from(tagNodes).some((node) =>
            node.classList.contains("hidden")
        );
        tagNodes.forEach((node) => {
            node.classList.toggle("hidden", !shouldShow);
        });
        toggleButton.textContent = shouldShow ? "Hide Tags" : "Show Tags";
    });
}

async function fetchData() {
    let rating = null;
    let tags = null;

    try {
        const response = await fetch(requestURL);
        const data = await response.json();
        const problemsList = data.result.problems;

        if (data.status === "OK") {
            for (let i = 0; i < problemsList.length; i++) {
                if (problemsList[i].index === index) {
                    rating = problemsList[i].rating;
                    tags = problemsList[i].tags;
                    break;
                }
            }
        } else {
            rating = -1;
        }
    } catch (e) {
        rating = -1;
    }

    const getRatingBox = document.createElement("div");
    getRatingBox.innerHTML = buildBoxHtml(rating, tags);
    const sidebar = document.querySelector("#sidebar");
    if (!sidebar) {
        return;
    }

    document.querySelectorAll(".cfgr-container").forEach((node) => node.remove());

    sidebar.appendChild(getRatingBox);
    attachToggleHandler(getRatingBox);
}
