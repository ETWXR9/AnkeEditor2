
rootDir = window.api.rootDir;

let timeoutId;

//各元素的引用
const menuDiv = document.getElementById('menu_div');
const editDiv = document.getElementById('edit_div');
const workDiv = document.getElementById('work_div');
const saveDiv = document.getElementById('save_div');
const saveExploreDiv = document.getElementById('save_explore_tab');
const diceHistoryDiv = document.getElementById('dice_history_tab');
const localImgDiv = document.getElementById('local_img_div');
const localCharaDiv = document.getElementById('local_chara_div');
const onlineImgDiv = document.getElementById('online_img_div');
const onlineCharaDiv = document.getElementById('online_chara_div');

const fontColorInput = document.getElementById('font_color_input');
const bgColorInput = document.getElementById('bg_color_input');
const tag1ColorInput = document.getElementById('tag1_color_input');
const tag2ColorInput = document.getElementById('tag2_color_input');
const highlightColorInput = document.getElementById('highlight_color_input');

var currentChapterDir = "";

function openDevTools() {
    window.api.openDevTools();
}

//打开文件夹
function openRootDir() {
    window.api.openRootDir();
}

// when tab clicked, change the tab content
function openImageTab(evt, tabName) {
    // 1. Hide all elements with class="imagetabcontent" by setting the style.display property to "none"
    let imagetabcontent = document.getElementsByClassName("imagetabcontent");
    for (i = 0; i < imagetabcontent.length; i++) {
        imagetabcontent[i].style.display = "none";
    }
    // 2. Remove the class "active" from all elements with class="tablinks"
    let tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
    // 3. Show the current tab, and add an "active" class to the button that opened the tab
    document.getElementById(tabName).style.display = "flex";
    evt.currentTarget.className += " active";
    // 4. change the config
    config.imgType = tabName;
    saveConfig();
}


//#region editDiv

function breakLine() {
    document.execCommand('insertHTML', false, '</div>');
    document.execCommand('insertHTML', false, '<div>');
}

function scrollToSelection() {
    let tempBr = document.createElement('br');
    window.getSelection().getRangeAt(0).insertNode(tempBr);
    tempBr.scrollIntoView(true, { behavior: "smooth", block: "end" });
    tempBr.remove();
}

function wordCount() {
    let imgCount = editDiv.getElementsByTagName("img").length;
    let charaCount = editDiv.innerText.replace(/\r|\n|\s/g, "").length;
    alert(`字数：${charaCount}，图片数：${imgCount}`);
}


// listen to paste event, clear the style and insert the pure text and image
editDiv.addEventListener('paste', function (e) {
    // 判断粘贴的内容是纯文本还是HTML，如果不是HTML则返回
    if (!e.clipboardData.types.includes('text/html')) {
        return;
    }
    e.preventDefault();
    // 获取粘贴的内容
    const html = e.clipboardData.getData('text/html');
    const start = html.indexOf('<!--StartFragment-->');
    const end = html.indexOf('<!--EndFragment-->');
    let result = html.substring(start + 20, end);
    //清除其中的文本和图片的所有额外格式，插入纯净的文本和图片
    result = result.replace(/<img[^>]*>/g, function (match) {
        // 获取图片的src
        const src = match.match(/src="([^"]*)"/);
        if (src && src.length >= 2) {
            return `<img src="${src[1]}">`;
        }
        return '';
    });
    //clear style
    result = result.replace(/style="[^"]*"/g, '');
    //clear word format
    result = result.replace(/<o:p>[\s\S]*?<\/o:p>/g, '');
    //clear font
    result = result.replace(/<font[^>]*>/g, '').replace(/<\/font>/g, '');
    //clear class 
    result = result.replace(/class=[^>]*>/g, '');
    // insert html
    document.execCommand('insertHTML', false, result);
});


// Record cursor position when edit_div loses focus
let savedSelection;
editDiv.addEventListener('selectionchange', (e) => {
    //prevent on dice_div class
    if (e.target.className === "dice_div") {
        return;
    }
    saveSelection();
});
// editDiv.addEventListener('selectstart', () => {

//     saveSelection();
// });
editDiv.addEventListener('input', (e) => {
    //prevent on dice_div class
    if (e.target.className === "dice_div") {
        return;
    }
    saveSelection();
});
editDiv.addEventListener('keyup', (e) => {
    //prevent on dice_div class
    if (e.target.className === "dice_div") {
        return;
    }
    saveSelection();
});
editDiv.addEventListener('mouseup', (e) => {
    //prevent on dice_div class
    if (e.target.className === "dice_div") {
        return;
    }
    //check if editdiv is focused
    if (document.activeElement === editDiv) {
        saveSelection();
    }
});
function saveSelection() {

    const sel = window.getSelection();

    //add a new range to the selection
    if (sel.rangeCount) {
        savedSelection = sel.getRangeAt(0);
    }

    // //log
    // console.log(`save selection:`);
    // console.log(savedSelection);

}
function restoreSelection() {
    if (savedSelection) {
        if (window.getSelection) {
            const sel = window.getSelection();
            sel.removeAllRanges();
            sel.addRange(savedSelection);
            sel.collapseToEnd();
        } else if (document.selection && savedSelection.select) {
            savedSelection.select();
        }
    }
    //log
    console.log(`restore selection:`);
    console.log(savedSelection);
    savedSelection = false;
}

//listen to ctrl+q
document.addEventListener('keydown', function (e) {
    if (e.ctrlKey && e.key.toLowerCase() === 'q') {
        //insert 10 lines with a number at the start of each line
        document.execCommand('insertHTML', false, '<p>1.</p><p>2.</p><p>3.</p><p>4.</p><p>5.</p><p>6.</p><p>7.</p><p>8.</p><p>9.</p><p>10.</p>');
    }
});

//#endregion EditDiv

//#region local CharaDiv and ImageDiv


// Create the expandable CharaGroup divs
function initLocalGroup() {
    // Clear the localCharaDiv
    localCharaDiv.innerHTML = '';
    // Read the contents of the Charas directory
    const localCharasDir = window.api.join(window.api.rootDir(), '本地图库');
    const localCharaGroups = window.api.getAllDirs(localCharasDir);

    localCharaGroups.forEach(charaGroup => {
        const charaGroupDiv = document.createElement('div');
        //create a header div for name
        const groupHeader = document.createElement('div');
        groupHeader.innerText = "+" + charaGroup;
        groupHeader.classList.add('group_header');
        charaGroupDiv.appendChild(groupHeader);
        charaGroupDiv.classList.add('group_list');
        localCharaDiv.appendChild(charaGroupDiv);
        // Read the contents of the CharaGroup directory
        const charaGroupDir = window.api.join(localCharasDir, charaGroup);
        const charaNamess = window.api.getAllDirs(charaGroupDir)
        // Create CharaName divs
        charaNamess.forEach(charaName => {
            const charaNameDiv = document.createElement('div');
            charaNameDiv.innerText = charaName;
            charaNameDiv.classList.add('chara_name');
            charaNameDiv.style.display = "none";
            charaGroupDiv.appendChild(charaNameDiv);

            // Read the contents of the CharaName directory and create the charas
            charaNameDiv.addEventListener('click', () => {
                //check if the tab already contains the CharaName div with same id
                if (document.getElementById("local_" + charaGroup + "_" + charaName) !== null) {
                    //if yes, remove the div
                    document.getElementById("local_" + charaGroup + "_" + charaName).remove();
                    return;
                }
                // Read the contents of the CharaName directory
                const charaNameDir = window.api.join(charaGroupDir, charaName);
                const imageUrls = window.api.getImageUrl(charaNameDir);
                // Create the image containers
                const charaImagesDiv = document.createElement('div');
                charaImagesDiv.classList.add('chara_container');
                charaImagesDiv.id = "local_" + charaGroup + "_" + charaName;
                //create a header div for name
                const charaNameHeader = document.createElement('div');
                charaNameHeader.classList.add('chara_container_header');
                charaNameHeader.innerText = charaName;
                charaNameHeader.addEventListener('click', () => {
                    //when the header is clicked, remove the charaImagesDiv
                    charaImagesDiv.remove();
                });
                charaImagesDiv.appendChild(charaNameHeader);
                //create images
                imageUrls.forEach(imageUrl => {
                    const imageContainer = document.createElement('div');
                    imageContainer.classList.add('chara_image_container');
                    const image = document.createElement('img');
                    image.classList.add('chara_image');
                    image.src = imageUrl;
                    imageContainer.appendChild(image);
                    charaImagesDiv.appendChild(imageContainer);
                    //when the image is clicked, insert the image into the edit div
                    imageContainer.addEventListener('mouseup', () => {
                        editDiv.focus();
                        restoreSelection();
                        const imageHtml = '<img src="' + imageUrl + '" />';
                        document.execCommand('insertHTML', false, imageHtml);
                        scrollToSelection();
                        //插图带人名
                        if (config.imgWithName) {
                            document.execCommand('insertText', false, "\n" + charaName + "：");
                            scrollToSelection();
                        }
                    });
                });
                //insert the div before the first child of the local_images_div
                localImgDiv.insertBefore(charaImagesDiv, localImgDiv.firstChild);

                //sort the imageContainer according to the order in the order.json
                const imageOrderJson = window.api.readJson(window.api.join(charaNameDir, 'order.json'));
                if (imageOrderJson !== null) {
                    //sort the imageContainer according to the order in the order.json
                    const imageContainers = charaImagesDiv.getElementsByClassName('chara_image_container');
                    const imageContainersArray = Array.from(imageContainers);
                    imageContainersArray.sort((a, b) => {
                        //sort by image file name
                        const aFileName = a.firstChild.src.split('/').pop();
                        const bFileName = b.firstChild.src.split('/').pop();
                        const aIndex = imageOrderJson.indexOf(aFileName);
                        const bIndex = imageOrderJson.indexOf(bFileName);
                        return aIndex - bIndex;
                    });
                    imageContainersArray.forEach(imageContainer => {
                        charaImagesDiv.appendChild(imageContainer);
                    });
                } else {
                    //create a default order.json
                    const imageContainers = charaImagesDiv.getElementsByClassName('chara_image_container');
                    const imageContainersArray = Array.from(imageContainers);
                    const imageOrderJson = [];
                    imageContainersArray.forEach(imageContainer => {
                        imageOrderJson.push(imageContainer.firstChild.src.split('/').pop());
                    }
                    );
                    window.api.writeJson(window.api.join(charaNameDir, 'order.json'), imageOrderJson);

                }

                //create a sortable for the imageContainer
                window.api.createSortable(charaImagesDiv, (event) => {
                    //save the order of the imageContainer
                    const imageContainers = charaImagesDiv.getElementsByClassName('chara_image_container');
                    const imageContainersArray = Array.from(imageContainers);
                    const imageOrderJson = [];
                    imageContainersArray.forEach(imageContainer => {
                        imageOrderJson.push(imageContainer.firstChild.src.split('/').pop());
                    }
                    );
                    window.api.writeJson(window.api.join(charaNameDir, 'order.json'), imageOrderJson);
                    //re insert the header div
                    charaImagesDiv.insertBefore(charaNameHeader, charaImagesDiv.firstChild);
                }, { filter: '.chara_container_header' });
            });
        });
        //sort the charaNameDivs according to the order in the order.json
        const charaNameOrderJson = window.api.readJson(window.api.join(charaGroupDir, 'order.json'));
        if (charaNameOrderJson !== null) {
            //sort the charaNameDivs according to the order in the order.json
            const charaNameDivs = charaGroupDiv.getElementsByClassName('chara_name');
            const charaNameDivsArray = Array.from(charaNameDivs);
            charaNameDivsArray.sort((a, b) => {
                return charaNameOrderJson.indexOf(a.innerText) - charaNameOrderJson.indexOf(b.innerText);
            });
            charaNameDivsArray.forEach(charaNameDiv => {
                charaGroupDiv.appendChild(charaNameDiv);
            });
        } else {
            //create a default order.json
            const charaNameDivs = charaGroupDiv.getElementsByClassName('chara_name');
            const charaNameDivsArray = Array.from(charaNameDivs);
            const charaNameOrder = charaNameDivsArray.map(charaNameDiv => charaNameDiv.innerText);
            window.api.writeJson(window.api.join(charaGroupDir, 'order.json'), charaNameOrder);
        }
        //create a sortable for the charaNameDivs
        window.api.createSortable(charaGroupDiv, (event) => {
            //save the order of the charaNameDivs
            const charaNameDivs = charaGroupDiv.getElementsByClassName('chara_name');
            const charaNameDivsArray = Array.from(charaNameDivs);
            const charaNameOrder = charaNameDivsArray.map(charaNameDiv => charaNameDiv.innerText);
            window.api.writeJson(window.api.join(charaGroupDir, 'order.json'), charaNameOrder);
        });

        //when the groupHeader div is clicked, expand or collapse the div
        groupHeader.addEventListener('click', () => {
            //if the div is expanded (first letter is "-"), collapse it
            if (groupHeader.innerText[0] === '-') {
                //set all the CharaName divs display to none
                const charaNameDivs = charaGroupDiv.getElementsByClassName('chara_name');
                for (let i = 0; i < charaNameDivs.length; i++) {
                    charaNameDivs[i].style.display = "none";
                }

                groupHeader.innerText = "+" + groupHeader.innerText.substring(1);
            }
            //if the div is collapsed (first letter is "+"), expand it
            else {
                //set all the CharaName divs display to block
                const charaNameDivs = charaGroupDiv.getElementsByClassName('chara_name');
                for (let i = 0; i < charaNameDivs.length; i++) {
                    charaNameDivs[i].style.display = "block";
                }
                groupHeader.innerText = "-" + groupHeader.innerText.substring(1);
            }
        });
    });
    //sort the charaGroupDivs according to the order in the order.json
    const charaGroupOrderJson = window.api.readJson(window.api.join(localCharasDir, 'order.json'));
    if (charaGroupOrderJson !== null) {
        //sort the charaGroupDivs according to the order in the order.json
        const charaGroupDivs = localCharaDiv.getElementsByClassName('group_list');
        const charaGroupDivsArray = Array.from(charaGroupDivs);
        charaGroupDivsArray.sort((a, b) => {
            return charaGroupOrderJson.indexOf(a.innerText) - charaGroupOrderJson.indexOf(b.innerText);
        });
        charaGroupDivsArray.forEach(charaGroupDiv => {
            localCharaDiv.appendChild(charaGroupDiv);
        });
    } else {
        //create a default order.json
        const charaGroupDivs = localCharaDiv.getElementsByClassName('group_list');
        const charaGroupDivsArray = Array.from(charaGroupDivs);
        const charaGroupOrder = charaGroupDivsArray.map(charaGroupDiv => charaGroupDiv.innerText);
        window.api.writeJson(window.api.join(localCharasDir, 'order.json'), charaGroupOrder);
    }
    //create a chara search input at the top of the charaDiv div
    const charaSearchInput = document.createElement('input');
    charaSearchInput.type = 'text';
    charaSearchInput.placeholder = '搜索人物';
    charaSearchInput.classList.add('chara_search_input');
    localCharaDiv.insertBefore(charaSearchInput, localCharaDiv.firstChild);
    //create a prompt list below the charaSearchInput
    const promptList = document.createElement('div');
    promptList.classList.add('prompt_list');
    //insert promptList after charaSearchInput
    charaSearchInput.parentNode.insertBefore(promptList, charaSearchInput.nextSibling);
    //when the user types in the charaSearchInput, show the prompt list
    charaSearchInput.addEventListener('input', () => {
        promptList.innerHTML = ''; // clear previous prompt list items
        //if the input is empty, hide the prompt list
        if (charaSearchInput.value === '') {
            return;
        }
        const charaNameDivs = localCharaDiv.getElementsByClassName('chara_name');
        for (let i = 0; i < charaNameDivs.length; i++) {
            const charaName = charaNameDivs[i].innerText.toLowerCase();
            if (charaName.indexOf(charaSearchInput.value.toLowerCase()) > -1) {
                const promptItem = document.createElement('div');
                //get charaGroup
                const charaGroup = charaNameDivs[i].parentNode.getElementsByClassName('group_header')[0].innerText.substring(1);
                promptItem.innerText = charaName + "(" + charaGroup + ")";
                promptItem.setAttribute("charaName", charaName);
                promptItem.addEventListener('click', () => {
                    charaSearchInput.value = "";
                    promptList.innerHTML = '';
                    //perform a click on the charaNameDiv
                    const charaNameDivs = localCharaDiv.getElementsByClassName('chara_name');
                    for (let i = 0; i < charaNameDivs.length; i++) {
                        if (charaNameDivs[i].innerText.toLowerCase() === promptItem.getAttribute("charaName")) {
                            charaNameDivs[i].click();
                            break;
                        }
                    }
                });
                promptList.appendChild(promptItem);
            }
        }
    });
    //when the user presses the down or up arrow key, select the next or previous prompt item
    charaSearchInput.addEventListener('keydown', (event) => {
        const promptItems = promptList.children;
        if (promptItems.length > 0) {
            let selectedPromptItem = promptList.querySelector('.search_prompt_selected');
            if (event.key === 'ArrowDown') {
                if (!selectedPromptItem) {
                    selectedPromptItem = promptItems[0];
                } else {
                    selectedPromptItem.classList.remove('search_prompt_selected');
                    selectedPromptItem = selectedPromptItem.nextElementSibling || promptItems[0];
                }
                selectedPromptItem.classList.add('search_prompt_selected');
            } else if (event.key === 'ArrowUp') {
                if (!selectedPromptItem) {
                    selectedPromptItem = promptItems[promptItems.length - 1];
                } else {
                    selectedPromptItem.classList.remove('search_prompt_selected');
                    selectedPromptItem = selectedPromptItem.previousElementSibling || promptItems[promptItems.length - 1];
                }
                selectedPromptItem.classList.add('search_prompt_selected');
            } else if (event.key === 'Enter' && selectedPromptItem) {
                //perform a click on the selected prompt item
                selectedPromptItem.click();
            }
        }
    });

}
initLocalGroup();

//#endregion local CharaDiv and ImageDiv

//#region online CharaDiv and ImageDiv

// Create the expandable CharaGroup divs
function initOnlineGroup() {
    //clear the onlineCharaDiv
    onlineCharaDiv.innerHTML = '';
    // Read the contents of the OnlineCharas directory
    const onlineCharasDir = window.api.join(window.api.rootDir(), '在线图库');
    const onlineCharaGroups = window.api.getAllDirs(onlineCharasDir);
    onlineCharaDiv.innerHTML = '';
    // Create CharaGroup divs
    onlineCharaGroups.forEach(charaGroupName => {
        //create a group_list div
        const charaGroupDiv = document.createElement('div');
        charaGroupDiv.classList.add('group_list');
        onlineCharaDiv.appendChild(charaGroupDiv);
        //create a header div for name
        const groupHeader = document.createElement('div');
        groupHeader.innerText = "+" + charaGroupName;
        groupHeader.classList.add('group_header');
        charaGroupDiv.appendChild(groupHeader);
        // Read the contents of the CharaGroup directory
        const charaGroupDir = window.api.join(onlineCharasDir, charaGroupName);
        const charaJsonDirs = window.api.getAllJson(charaGroupDir);
        // Create CharaName divs
        charaJsonDirs.forEach(jsonDir => {
            //ignore the oreder.json file
            if (jsonDir.indexOf('order.json') !== -1) {
                return;
            }
            createNewOnlineCharaDiv(jsonDir, charaGroupDiv, charaGroupName);

        });
        //sort the charaNameDivs according to the order in the order.json
        const charaNameOrderJson = window.api.readJson(window.api.join(charaGroupDir, 'order.json'));
        if (charaNameOrderJson !== null) {
            //sort the charaNameDivs according to the order in the order.json
            const charaNameDivs = charaGroupDiv.getElementsByClassName('chara_name');
            const charaNameDivsArray = Array.from(charaNameDivs);
            charaNameDivsArray.sort((a, b) => {
                return charaNameOrderJson.indexOf(a.innerText) - charaNameOrderJson.indexOf(b.innerText);
            });
            charaNameDivsArray.forEach(charaNameDiv => {
                charaGroupDiv.appendChild(charaNameDiv);
            });
        } else {
            //create a default order.json
            const charaNameDivs = charaGroupDiv.getElementsByClassName('chara_name');
            const charaNameDivsArray = Array.from(charaNameDivs);
            const charaNameOrder = charaNameDivsArray.map(charaNameDiv => charaNameDiv.innerText);
            window.api.writeJson(window.api.join(charaGroupDir, 'order.json'), charaNameOrder);
        }
        //add a new_chara input
        const newCharaInput = document.createElement('input');
        newCharaInput.classList.add('new_chara');
        newCharaInput.type = 'text';
        newCharaInput.placeholder = 'new chara';
        newCharaInput.style.display = 'none';
        charaGroupDiv.appendChild(newCharaInput);
        //when the new_chara press enter, create a new chara json file.
        newCharaInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const newCharaName = newCharaInput.value;
                if (newCharaName === '') return;
                //check if the chara name already exists
                const charaNameDivs = charaGroupDiv.getElementsByClassName('chara_name');
                let charaNameExists = false;
                let existedcharaNameDivs;
                for (let i = 0; i < charaNameDivs.length; i++) {
                    if (charaNameDivs[i].innerText === newCharaName) {
                        charaNameExists = true;
                        existedcharaNameDivs = charaNameDivs[i];
                        break;
                    }
                }
                if (!charaNameExists) {
                    //create a new chara json file
                    const newCharaJson = { pics: [] };
                    window.api.writeJson(window.api.join(charaGroupDir, newCharaName + '.json'), newCharaJson);
                    //create a new chara div
                    createNewOnlineCharaDiv(window.api.join(charaGroupDir, newCharaName + '.json'), charaGroupDiv, charaGroupName);
                    //click the groupHeader to expand the charaGroupDiv
                    groupHeader.click();
                    //re append the newCharaInput
                    charaGroupDiv.appendChild(newCharaInput);
                } else {
                    //click the existedcharaNameDivs to expand the charaNameDiv
                    existedcharaNameDivs.click();
                }

            }
        });
        //create a sortable for the charaNameDivs
        window.api.createSortable(charaGroupDiv, (event) => {
            //save the order of the charaNameDivs
            const charaNameDivs = charaGroupDiv.getElementsByClassName('chara_name');
            const charaNameDivsArray = Array.from(charaNameDivs);
            const charaNameOrder = charaNameDivsArray.map(charaNameDiv => charaNameDiv.innerText);
            window.api.writeJson(window.api.join(charaGroupDir, 'order.json'), charaNameOrder);
            //re append the newCharaInput
            charaGroupDiv.appendChild(newCharaInput);
        }, { filter: '.chara_name' });
        //when the groupHeader div is clicked, expand or collapse the div
        groupHeader.addEventListener('click', () => {
            //if the div is expanded (first letter is "-"), collapse it
            if (groupHeader.innerText[0] === '-') {
                //set all the CharaName divs display to none
                //get childNodes except the first one (groupHeader)
                const charaNameDivs = Array.prototype.slice.call(charaGroupDiv.childNodes, 1);
                for (let i = 0; i < charaNameDivs.length; i++) {
                    charaNameDivs[i].style.display = "none";
                }

                groupHeader.innerText = "+" + groupHeader.innerText.substring(1);
            }
            //if the div is collapsed (first letter is "+"), expand it
            else {
                //set all the CharaName divs display to block
                //get childNodes except the first one (groupHeader)
                const charaNameDivs = Array.prototype.slice.call(charaGroupDiv.childNodes, 1);
                for (let i = 0; i < charaNameDivs.length; i++) {
                    charaNameDivs[i].style.display = "block";
                }
                groupHeader.innerText = "-" + groupHeader.innerText.substring(1);
            }
        });
    });
    //sort the charaGroupDivs according to the order in the order.json
    const charaGroupOrderJson = window.api.readJson(window.api.join(onlineCharasDir, 'order.json'));
    if (charaGroupOrderJson !== null) {
        //sort the charaGroupDivs according to the order in the order.json
        const charaGroupDivs = onlineCharaDiv.getElementsByClassName('group_list');
        const charaGroupDivsArray = Array.from(charaGroupDivs);
        charaGroupDivsArray.sort((a, b) => {
            return charaGroupOrderJson.indexOf(a.innerText) - charaGroupOrderJson.indexOf(b.innerText);
        });
        charaGroupDivsArray.forEach(charaGroupDiv => {
            onlineCharaDiv.appendChild(charaGroupDiv);
        });
    } else {
        //create a default order.json
        const charaGroupDivs = onlineCharaDiv.getElementsByClassName('group_list');
        const charaGroupDivsArray = Array.from(charaGroupDivs);
        const charaGroupOrder = charaGroupDivsArray.map(charaGroupDiv => charaGroupDiv.innerText);
        window.api.writeJson(window.api.join(onlineCharasDir, 'order.json'), charaGroupOrder);
    }
    //create a chara search input at the top of the charaDiv div
    const charaSearchInput = document.createElement('input');
    charaSearchInput.type = 'text';
    charaSearchInput.placeholder = '搜索人物';
    charaSearchInput.classList.add('chara_search_input');
    onlineCharaDiv.insertBefore(charaSearchInput, onlineCharaDiv.firstChild);
    //create a prompt list below the charaSearchInput
    const promptList = document.createElement('div');
    promptList.classList.add('prompt_list');
    //insert promptList after charaSearchInput
    charaSearchInput.parentNode.insertBefore(promptList, charaSearchInput.nextSibling);
    //when the user types in the charaSearchInput, show the prompt list
    charaSearchInput.addEventListener('input', () => {
        promptList.innerHTML = ''; // clear previous prompt list items
        //if the input is empty, hide the prompt list
        if (charaSearchInput.value === '') {
            return;
        }
        const charaNameDivs = onlineCharaDiv.getElementsByClassName('chara_name');
        for (let i = 0; i < charaNameDivs.length; i++) {
            const charaName = charaNameDivs[i].innerText.toLowerCase();
            if (charaName.indexOf(charaSearchInput.value.toLowerCase()) > -1) {
                const promptItem = document.createElement('div');
                //get charaGroup
                const charaGroup = charaNameDivs[i].parentNode.getElementsByClassName('group_header')[0].innerText.substring(1);
                promptItem.innerText = charaName + "(" + charaGroup + ")";
                //store charaName in the promptItem
                promptItem.setAttribute('charaName', charaName);
                promptItem.addEventListener('click', () => {
                    charaSearchInput.value = "";
                    promptList.innerHTML = '';
                    //perform a click on the charaNameDiv
                    const charaNameDivs = onlineCharaDiv.getElementsByClassName('chara_name');
                    for (let i = 0; i < charaNameDivs.length; i++) {
                        if (charaNameDivs[i].innerText === promptItem.getAttribute('charaName')) {
                            charaNameDivs[i].click();
                            break;
                        }
                    }
                });
                promptList.appendChild(promptItem);
            }
        }
    });
    //when the user presses the down or up arrow key, select the next or previous prompt item
    charaSearchInput.addEventListener('keydown', (event) => {
        const promptItems = promptList.children;
        if (promptItems.length > 0) {
            let selectedPromptItem = promptList.querySelector('.search_prompt_selected');
            if (event.key === 'ArrowDown') {
                if (!selectedPromptItem) {
                    selectedPromptItem = promptItems[0];

                } else {
                    selectedPromptItem.classList.remove('search_prompt_selected');
                    selectedPromptItem = selectedPromptItem.nextElementSibling || promptItems[0];

                }
                selectedPromptItem.classList.add('search_prompt_selected');
            } else if (event.key === 'ArrowUp') {
                if (!selectedPromptItem) {
                    selectedPromptItem = promptItems[promptItems.length - 1];

                } else {
                    selectedPromptItem.classList.remove('search_prompt_selected');
                    selectedPromptItem = selectedPromptItem.previousElementSibling || promptItems[promptItems.length - 1];

                }
                selectedPromptItem.classList.add('search_prompt_selected');
            } else if (event.key === 'Enter' && selectedPromptItem) {
                //perform a click on the selected prompt item
                selectedPromptItem.click();
            }
        }
    });

}
initOnlineGroup();

function refreshChara() {
    initLocalGroup();
    initOnlineGroup();
}

function createNewOnlineImageContainer(parentDiv, url, charaGroupName) {
    const imageContainer = document.createElement('div');
    imageContainer.classList.add('chara_image_container');
    const image = document.createElement('img');
    image.classList.add('chara_image');
    image.src = url;
    imageContainer.appendChild(image);
    parentDiv.appendChild(imageContainer);
    //when the image is clicked, insert the image into the edit div
    imageContainer.addEventListener('mouseup', (e) => {
        //log

        //when left click, insert the image
        if (e.button === 0) {
            editDiv.focus();
            restoreSelection();
            const imageHtml = '<img src="' + url + '" />';
            document.execCommand('insertHTML', false, imageHtml);
            scrollToSelection();
            //插图带人名
            if (config.imgWithName) {
                const charaName = parentDiv.getElementsByClassName('chara_container_header')[0].innerText;
                document.execCommand('insertText', false, "\n" + charaName + "：");
                scrollToSelection();
            }
        }
        //when right click on ctrl, delete the image
        else if (e.button === 2 && e.ctrlKey) {
            //delete the image container
            imageContainer.remove();
            //save chara json
            //get charaName
            const charaName = parentDiv.getElementsByClassName('chara_container_header')[0].innerText;
            saveCharaJson(charaGroupName, charaName);
        }
    });
}

function createNewOnlineCharaDiv(jsonDir, charaGroupDiv, charaGroupName) {
    //get charaName from jsonDir
    let charaName = jsonDir.split('\\').pop().split('.').shift();
    //create charaNameDiv
    const charaNameDiv = document.createElement('div');
    charaNameDiv.innerText = charaName;
    charaNameDiv.classList.add('chara_name');
    charaNameDiv.style.display = "none";
    charaGroupDiv.appendChild(charaNameDiv);
    // Read the contents of the charajson and create the image containers
    charaNameDiv.addEventListener('click', () => {
        //check if onlineImgDiv already contains the CharaName div with same id
        if (document.getElementById("online_" + charaGroupName + "_" + charaName) !== null) {
            //if yes, remove the div
            document.getElementById("online_" + charaGroupName + "_" + charaName).remove();
            return;
        }
        //read charajson
        const charaJson = window.api.readJson(jsonDir);
        //get image urls, it is an url array
        const imageUrls = charaJson.pics;
        // Create the image containers
        const charaImagesDiv = document.createElement('div');
        charaImagesDiv.classList.add('chara_container');
        charaImagesDiv.id = "online_" + charaGroupName + "_" + charaName;
        //create a header div for name
        const charaNameHeader = document.createElement('div');
        charaNameHeader.classList.add('chara_container_header');
        charaNameHeader.innerText = charaName;
        charaNameHeader.addEventListener('click', () => {
            //when the header is clicked, remove the charaImagesDiv
            charaImagesDiv.remove();
        });
        charaImagesDiv.appendChild(charaNameHeader);
        //insert the div before the first child of the charaImagesDiv
        onlineImgDiv.insertBefore(charaImagesDiv, onlineImgDiv.firstChild);
        //create images
        imageUrls.forEach(imageUrl => {
            createNewOnlineImageContainer(charaImagesDiv, imageUrl, charaGroupName);
        });
        //add a new_image button, which is a img.
        const newImageContainer = document.createElement('div');
        newImageContainer.classList.add('new_image_container')
        charaImagesDiv.appendChild(newImageContainer);;
        const newImage = document.createElement('img');
        newImage.classList.add('new_image');
        newImage.src = 'new_image.png';
        newImageContainer.appendChild(newImage);
        //when the new_image is clicked, read the image url from clipboard and add it to the charaImagesDiv, and save it to the json
        newImageContainer.addEventListener('click', () => {
            //get clipboard text
            const clipboardText = window.api.getClipboard();
            //log

            //match all img url
            const imgUrls = clipboardText.match(/(http(s?):)([/|.|\w|\s|-])*\.(?:jpg|gif|png)/g);
            if (imgUrls !== null) {
                imgUrls.forEach(imgUrl => {
                    //create a new image container
                    createNewOnlineImageContainer(charaImagesDiv, imgUrl, charaGroupName);
                    //save the image url to the json
                    const charaJson = window.api.readJson(jsonDir);
                    charaJson.pics.push(imgUrl);
                    window.api.writeJson(jsonDir, charaJson);
                });
                //re append the new_image button
                charaImagesDiv.appendChild(newImageContainer);
            }
        });
        //create a sortable for the imageContainer
        window.api.createSortable(charaImagesDiv, (event) => {
            //save the order of the imageContainer
            const imageContainers = charaImagesDiv.getElementsByClassName('chara_image_container');
            const imageContainersArray = Array.from(imageContainers);
            const imageUrlsJson = { pics: [] };
            imageContainersArray.forEach(imageContainer => {
                imageUrlsJson.pics.push(imageContainer.getElementsByTagName('img')[0].src);
            });
            window.api.writeJson(jsonDir, imageUrlsJson);
            //re append the new_image button 
            charaImagesDiv.appendChild(newImageContainer);
            //re insert the charaNameHeader to the first child
            charaImagesDiv.insertBefore(charaNameHeader, charaImagesDiv.firstChild);

        }, { filter: '.chara_container_header, .new_image_container' });
    });
}

function saveCharaJson(charaGroupName, charaName) {
    //get the charaJson dir
    const charaJsonDir = window.api.join(window.api.rootDir(), '在线图库', charaGroupName, charaName + '.json');
    //log

    //get the charaDiv
    const charaDiv = document.getElementById("online_" + charaGroupName + "_" + charaName);
    //get the imageContainers
    const imageContainers = charaDiv.getElementsByClassName('chara_image_container');
    //get the image urls
    const imageUrls = [];
    Array.from(imageContainers).forEach(imageContainer => {
        imageUrls.push(imageContainer.getElementsByTagName('img')[0].src);
    });
    //save the image urls to the json
    const charaJson = { pics: imageUrls };
    window.api.writeJson(charaJsonDir, charaJson);
}

//#endregion online CharaDiv and ImageDiv

//#region save
var aritlceName = '';
var chapterName = '';
var editDivUnsaved = false;
//listen to the editDiv change
editDiv.addEventListener('input', () => {

    editDivUnsaved = true;
});
//save the article
function saveChapter() {
    if (!editDivUnsaved) return;
    if (currentChapterDir === "") {
        //get the saved pathy
        var chapterDir = window.api.saveNewChapter();
        //check if the path is undefined
        if (chapterDir === undefined) {
            //log
            return;
        }
    }
    //get the content
    const chapterJson = { text: editDiv.innerHTML, history: diceHistoryDiv.innerHTML };
    //save the text to the article dir
    window.api.writeJson(currentChapterDir, chapterJson);
    //log

    editDivUnsaved = false;
}
function getSaveDialogResult(dir) {
    //log

    currentChapterDir = dir;
}
//read all the articles to save tab
function readAllArticles() {
    saveExploreDiv.innerHTML = '';
    //get the articles dir
    const articlesDir = window.api.join(window.api.rootDir(), '文章');
    //read all the articles
    const articles = window.api.getAllDirs(articlesDir);
    //log

    //create the article divs
    articles.forEach(articleName => {
        //create the article div
        const articleDiv = document.createElement('div');
        articleDiv.classList.add('article_div');
        articleDiv.id = articleName;
        //create the article name div
        const articleNameDiv = document.createElement('div');
        articleNameDiv.classList.add('article_name_div');
        articleNameDiv.innerText = "+" + articleName;
        articleDiv.appendChild(articleNameDiv);
        //create the article chapters div
        const articleChaptersDiv = document.createElement('div');
        articleChaptersDiv.classList.add('article_chapters_div');
        //hide
        articleChaptersDiv.style.display = 'none';
        articleDiv.appendChild(articleChaptersDiv);
        //add click event
        articleNameDiv.addEventListener('click', () => {
            if (articleChaptersDiv.style.display === 'none') {
                articleChaptersDiv.style.display = 'block';
                //change + to -
                articleNameDiv.innerText = "-" + articleName;
            } else {
                articleChaptersDiv.style.display = 'none';
                //change - to +
                articleNameDiv.innerText = "+" + articleName;
            }
        });
        //append the article div to the save tab
        saveExploreDiv.appendChild(articleDiv);
        //read all the chapters
        const chapters = window.api.getAllFileName(window.api.join(articlesDir, articleName));
        //create the chapter divs
        chapters.forEach(chapterFileName => {
            let cName;
            //check if the file is json
            if (chapterFileName.endsWith('.json')) {
                //get the chapter name
                cName = chapterFileName.split('.')[0];
            } else {
                //check if the file has no extension
                if (chapterFileName.indexOf('.') === -1) {
                    //get the chapter name
                    cName = chapterFileName;
                } else {
                    //log
                    console.log('文件名错误：' + chapterFileName);
                    return;
                }
            }
            //log
            console.log(`章节名：${cName}, 文件名：${chapterFileName}`)
            //create the chapterNameDiv
            const chapterNameDiv = document.createElement('div');
            chapterNameDiv.classList.add('chapter_name_div');
            chapterNameDiv.innerText = cName;
            //append the chapterNameDiv to the articleChaptersDiv
            articleChaptersDiv.appendChild(chapterNameDiv);
            //add click event
            chapterNameDiv.addEventListener('click', () => {
                //save the current chatper
                saveChapter();
                let chapterJson = window.api.readJson(window.api.join(articlesDir, articleName, chapterFileName));
                //set the editDiv content
                editDiv.innerHTML = chapterJson.text;
                //set the dice history
                diceHistoryDiv.innerHTML = chapterJson.history;
                //clear active chapterNameDiv className
                const activeChapterNameDivs = document.getElementsByClassName('chapter_name_div active');
                Array.from(activeChapterNameDivs).forEach(activeChapterNameDiv => {
                    activeChapterNameDiv.className = 'chapter_name_div';
                });
                //set chatperNameDiv className
                chapterNameDiv.className = 'chapter_name_div active';
                //set the currentChapterDir
                currentChapterDir = window.api.join(articlesDir, articleName, chapterFileName);
            });
        });
        //create the addNewChapter input
        const addNewChapterInput = document.createElement('input');
        addNewChapterInput.classList.add('add_new_chapter_input');
        addNewChapterInput.type = 'text';
        addNewChapterInput.placeholder = 'new chapter name';
        //append the addNewChapterInput to the articleChaptersDiv
        articleChaptersDiv.appendChild(addNewChapterInput);
        //add keyup event
        addNewChapterInput.addEventListener('keyup', (e) => {
            if (e.key === 'Enter') {
                //get the new chapter name
                const newChapterName = addNewChapterInput.value;
                //create the new chapter dir
                const newChapterDir = window.api.join(articlesDir, articleName, newChapterName + '.json');
                //create the new chapter json
                const newChapterJson = { text: '', history: '' };
                //save the new chapter json
                window.api.writeJson(newChapterDir, newChapterJson);
                // re init the save tab
                readAllArticles();
                //find the ArticleNameDiv and click
                const articleDiv = document.getElementById(articleName);
                const articleNameDiv = articleDiv.getElementsByClassName('article_name_div')[0];
                articleNameDiv.click();
                //find the new chapterNameDiv and click
                const articleChaptersDiv = articleDiv.getElementsByClassName('article_chapters_div')[0];
                const chapterNameDivs = articleChaptersDiv.getElementsByClassName('chapter_name_div');
                const newChapterNameDiv = Array.from(chapterNameDivs).find(chapterNameDiv => chapterNameDiv.innerText === newChapterName);
                newChapterNameDiv.click();
            }
        });
    });
}
readAllArticles();

// when tab clicked, change the tab content
function openSaveExploreTab(evt, tabName) {
    let saveTabContent = document.getElementsByClassName("save_tab_content");
    for (i = 0; i < saveTabContent.length; i++) {
        saveTabContent[i].style.display = "none";
    }
    let saveTabLinks = document.getElementsByClassName("save_tab_link");
    for (i = 0; i < saveTabLinks.length; i++) {
        saveTabLinks[i].className = saveTabLinks[i].className.replace(" active", "");
    }
    // 3. Show the current tab, and add an "active" class to the button that opened the tab
    document.getElementById(tabName).style.display = "block";
    evt.currentTarget.className += " active";
}

//clikc save_explore_tab_link
document.getElementById("save_explore_tab_link").click();

function screenShot() {
    window.api.saveScreenshot3();
}

//listen to ctrl+S to save
editDiv.addEventListener('keydown', function (e) {
    if (e.ctrlKey && e.keyCode == 83) {
        e.preventDefault();
        saveChapter();
    }
});

//on exit, save the current chapter
window.onbeforeunload = function (e) {
    saveChapter();
}


//save every 1 minute
setInterval(() => {
    if (currentChapterDir === "") return;
    saveChapter();
}, 60000);

//#endregion save

//#region Config
//config
const defaultConfig = {
    //字体大小
    fontSize: 26,
    //字体颜色
    fontColor: '#f5f5f5',
    //背景颜色
    bgColor: '#1c1c1c',
    //tag1颜色
    tag1Color: '#0F4C75',
    //tag2颜色
    tag2Color: '#3282B8',
    //高亮颜色
    highlightColor: '#BBE1FA',
    //图片大小
    imgSize: 100,
    //图库类型
    imgType: 'local_tab',
    //插图带人名
    imgWithName: false,
    //骰子带1D
    dicePrefix: false,
};
//clone
var config = JSON.parse(JSON.stringify(defaultConfig));

const configDir = window.api.join(window.api.rootDir(), 'config.json');
function saveConfig() {
    window.api.writeJson(configDir, config);
}
function readConfig() {
    config = window.api.readJson(configDir);
    if (!config) {
        config = JSON.parse(JSON.stringify(defaultConfig));
        saveConfig();
    }
    //compaer with defaultConfig , if not exist, add it
    for (const key in defaultConfig) {
        if (!config.hasOwnProperty(key)) {
            config[key] = defaultConfig[key];
        }
    }
    //save config
    saveConfig();
    //log
    console.log('config', config);
    //change :root css variable
    document.documentElement.style.setProperty('--font-size', config.fontSize + 'px');
    document.documentElement.style.setProperty('--font-color', config.fontColor);
    document.documentElement.style.setProperty('--bg-color', config.bgColor);
    document.documentElement.style.setProperty('--tag1-color', config.tag1Color);
    document.documentElement.style.setProperty('--tag2-color', config.tag2Color);
    document.documentElement.style.setProperty('--highlight-color', config.highlightColor);

    bgColorInput.value = config.bgColor;
    fontColorInput.value = config.fontColor;
    tag1ColorInput.value = config.tag1Color;
    tag2ColorInput.value = config.tag2Color;
    highlightColorInput.value = config.highlightColor;

    document.documentElement.style.setProperty('--img-size', config.imgSize + 'px');
    document.getElementById('img_with_name_button').innerHTML = config.imgWithName ? '插图带人名' : '插图不带人名';
    document.getElementById('dice_prefix_button').innerHTML = config.dicePrefix ? '骰子带1D' : '骰子不带1D';

    //set tab according to config
    if (config.imgType === 'local_tab') {
        document.getElementById('local_tab_link').click();
    } else {
        document.getElementById('online_tab_link').click();
    }

    //checkVersion
    window.api.checkVersion();
}
function resetConfig() {
    config = defaultConfig;
    saveConfig();
    readConfig();
}
readConfig();
editDiv.addEventListener('wheel', function (e) {
    //判断是否按下了alt键，如果没有按下则返回
    if (!e.altKey) return;
    e.preventDefault();
    config.fontSize += (e.deltaY > 0 ? -1 : 1);
    document.documentElement.style.setProperty('--font-size', config.fontSize + 'px');
    saveConfig();
});
//监听local_img_div的wheel事件，根据滚轮的方向改变图片大小，并保存到config
localImgDiv.addEventListener('wheel', function (e) {
    //判断是否按下了ctrl键，如果没有按下则返回
    if (!e.altKey) return;
    e.preventDefault();
    if (e.deltaY > 0) {
        config.imgSize -= 2;
    } else {
        config.imgSize += 3;
    }
    //限制图片大小的范围
    if (config.imgSize < 50) config.imgSize = 50;
    if (config.imgSize > 300) config.imgSize = 300;
    //change :root css variable
    document.documentElement.style.setProperty('--img-size', config.imgSize + 'px');
    saveConfig();
});
//监听local_img_div的wheel事件，根据滚轮的方向改变图片大小，并保存到config
onlineImgDiv.addEventListener('wheel', function (e) {
    //判断是否按下了ctrl键，如果没有按下则返回
    if (!e.altKey) return;
    e.preventDefault();
    if (e.deltaY > 0) {
        config.imgSize -= 2;
    } else {
        config.imgSize += 3;
    }
    //限制图片大小的范围
    if (config.imgSize < 50) config.imgSize = 50;
    if (config.imgSize > 300) config.imgSize = 300;
    //change :root css variable
    document.documentElement.style.setProperty('--img-size', config.imgSize + 'px');
    saveConfig();
});
//switch imgWithName
function switchImgWithName() {
    config.imgWithName = !config.imgWithName;
    document.getElementById('img_with_name_button').innerHTML = config.imgWithName ? '插图带人名' : '插图不带人名';
    saveConfig();
}
//switch dice prefix
function switchDicePrefix() {
    config.dicePrefix = !config.dicePrefix;
    document.getElementById('dice_prefix_button').innerHTML = config.dicePrefix ? '骰子带1D' : '骰子不带1D';
    saveConfig();
}
//font_color_input

fontColorInput.addEventListener('change', function (e) {
    config.fontColor = fontColorInput.value;
    document.documentElement.style.setProperty('--font-color', config.fontColor);
    saveConfig();
});
//bg_color_input

bgColorInput.addEventListener('change', function (e) {
    config.bgColor = bgColorInput.value;
    document.documentElement.style.setProperty('--bg-color', config.bgColor);
    saveConfig();
});

tag1ColorInput.addEventListener('change', function (e) {
    config.tag1Color = tag1ColorInput.value;
    document.documentElement.style.setProperty('--tag1-color', config.tag1Color);
    saveConfig();
});
tag2ColorInput.addEventListener('change', function (e) {
    config.tag2Color = tag2ColorInput.value;
    document.documentElement.style.setProperty('--tag2-color', config.tag2Color);
    saveConfig();
});
highlightColorInput.addEventListener('change', function (e) {
    config.highlightColor = highlightColorInput.value;
    document.documentElement.style.setProperty('--highlight-color', config.highlightColor);
    saveConfig();
});


//#endregion

//#region dice

let beforeDiceSel;
//ctrl+D触发骰子输入框
editDiv.addEventListener('keydown', function (e) {
    if (e.ctrlKey && e.key.toLowerCase() === 'd') {
        scrollToSelection();
        beforeDiceSel = window.getSelection().getRangeAt(0);
        setDiceInput();
        // document.execCommand('insertHTML', false, '<span id="hidden"></span>');
    }
});

// 计算骰子表达式的值
function rollDice(str) {
    // 匹配四则运算式
    let regex = /^(\d+d\d+|\d+)([\+\-\*\/](\d+d\d+|\d+))*$/;
    if (!regex.test(str)) {
        return null;
    }
    // 匹配骰子表达式并计算结果
    let diceRegex = /\d+d\d+/g;
    let result = str;
    let match = diceRegex.exec(str);
    while (match) {
        let dice = match[0];
        let [n, m] = dice.split("d").map(Number);
        let sum = 0;
        for (let i = 0; i < n; i++) {
            sum += Math.floor(Math.random() * m) + 1;
        }
        result = result.replace(dice, sum);
        match = diceRegex.exec(str);
    }
    // 计算四则运算式的结果
    let ans = eval(result);
    return `【${str} = ${result} = ${ans}】`;
}
// 不进行随机，而是按最大数值计算
function sumDice(str) {
    // 匹配四则运算式
    let regex = /^(\d+d\d+|\d+)([\+\-\*\/](\d+d\d+|\d+))*$/;
    if (!regex.test(str)) {
        return null;
    }
    // 匹配骰子表达式并计算结果
    let diceRegex = /\d+d\d+/g;
    let result = str;
    let match = diceRegex.exec(str);
    while (match) {
        let dice = match[0];
        let [n, m] = dice.split("d").map(Number);
        let sum = n * m;
        result = result.replace(dice, sum);
        match = diceRegex.exec(str);
    }
    // 计算四则运算式的结果
    let ans = eval(result);
    return ans;
}

//create the dice input div
function setDiceInput() {
    //get the position of the cursor
    let rect = window.getSelection().getRangeAt(0).getBoundingClientRect();
    let topPosition = rect.top;
    let leftPosition = rect.left;
    //if the cursor is at the beginning of a line, the position is 0
    if (topPosition === 0) {
        //create a hidden node to get the correct position of the cursor
        document.execCommand('insertHTML', false, '<span id="hiddenSpan"></span>');
        let hiddenNode = document.getElementById('hiddenSpan');
        let rect = hiddenNode.getBoundingClientRect();
        topPosition = rect.top;
        leftPosition = rect.left;
        hiddenNode.parentNode.removeChild(hiddenNode);
    }
    // create the dicediv
    let dicediv = document.createElement('div');
    dicediv.className = "dice_div";
    dicediv.style.left = leftPosition + "px";
    dicediv.style.top = topPosition + "px";
    // create the diceinput and dicesum
    let diceinput = document.createElement('input');
    diceinput.className = 'dice_input';
    diceinput.placeholder = '1d100+20-2d10'
    let dicesum = document.createElement('div');
    dicesum.className = 'dice_sum';
    dicediv.appendChild(diceinput);
    dicediv.appendChild(dicesum);
    editDiv.appendChild(dicediv);
    //log
    console.log("dice input created");
    diceinput.focus();
    if (config.dicePrefix) diceinput.value = "1d";
    //log
    console.log("dice input focused");
    diceinput.addEventListener("input", (e) => {
        let text = e.target.value;
        let sum = sumDice(text);
        if (sum !== null) {
            //通过测试，让dicesum显示总数
            dicesum.innerText = `总和：${sum} 点`;
        } else {
            dicesum.innerText = `格式错误`;
        };
    })
    diceinput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            let text = e.target.value;
            //判空
            if (text == "") return;
            let result = rollDice(text);
            if (result !== null) {
                //结算
                editDiv.focus();
                document.execCommand('insertText', false, result);
                //create dice history
                let diceHistoryItem = document.createElement('div');
                diceHistoryItem.className = 'dice_history_item_div';
                diceHistoryItem.innerText = result;
                diceHistoryDiv.appendChild(diceHistoryItem);
            }
        }
        else if (e.key === "Escape") {
            e.preventDefault();
            // if (document.getElementById('dicediv')) {
            //     dicediv.parentNode.removeChild(dicediv);
            // }
            editDiv.focus();
            // restoreSelection();
        }

    })
    diceinput.addEventListener("blur", (e) => {
        dicediv.parentNode.removeChild(dicediv);
        editDiv.focus();
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(beforeDiceSel);
        sel.collapseToEnd();
        beforeDiceSel = false;
    });
}
//#endregion dice