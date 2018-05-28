/**
 * @filename: controller.js
 * @author Alexander Poganatz
 * @author a_poganatz@outlook.com
 * @author poganatz.ca
 * @version 0.2
 * @date 2018-05-18
 * @brief implementation of JSON-Translator-Editor
 */

var listItemTemplate; // Generic list item node to clone
var list; // Reference to the list element

// Index in an array of input elements
const KEY_INDEX = 0;
const VALUE_INDEX = 1;
const NEW_VALUE_INDEX = 2;

// local storage keys
const SAVED_DATA_KEY = "SaveData";
const DOWNLOAD_TEXT = "Download";

const EXPORT_TEXT = "Export";
const SELECTED_CLASS = "w3-bottombar";

var downloadFileCallback = saveAsFile;

var fileName = "*.json";
var exportFileName = "*.json";
var fileNameInputElement;
var selectedItem = null;

/**
 * @fn onload
 * @brief initializes global variables
 */
window.onload = function()
{
    console.log("Loaded.");
    list = document.getElementById("list");
    listItemTemplate = list.firstElementChild.cloneNode(true);
    fileNameInputElement = document.getElementById('file-name-input');

    // After variables are initalized, call other functions as needed.
    loadBrowserCache();
}

/**
 * @fn addListItem
 * @brief Adds a item after the currently selected item. If no item is selected, add it to the end
 */
function addListItem()
{
    if(selectedItem == null)
        list.appendChild(listItemTemplate.cloneNode(true));
    else
        list.insertBefore(listItemTemplate.cloneNode(true), selectedItem.nextSibling);
}

/**
 * @fn removeListItem
 * @brief removes the currently selected list item.
 */
function removeListItem()
{
    if(selectedItem != null)
    {
        list.removeChild(selectedItem);
        selectedItem = null;
    }
}

/**
 * @fn ListItem
 * @brief basically a class to represent a list item
 * @param {*} key The JSON key
 * @param {*} value  The original language text
 * @param {*} newValue The new value to be translated
 */
function ListItem(key, value, newValue)
{
    this.key = key;
    this.value = value;
    this.newValue = newValue;
}

/**
 * @fn getTextAsJSON
 * @brief gets the values from the document returns it as a json string
 * @return an array of ListItem
 */
function getTextAsJSON()
{
    var data = [];
    for(var x = 0; x < list.children.length; ++x)
    {
        var inputs = list.children[x].getElementsByTagName("input");
        data.push(new ListItem(inputs[KEY_INDEX].value, inputs[VALUE_INDEX].value,
            inputs[NEW_VALUE_INDEX].value));
    }
    return data;
}

/**
 * @fn getTextAsJSON
 * @brief gets the values from the document returns it as a json string
 * @return an array of ListItem as a json string
 */
function getTextAsJSONString() { return JSON.stringify(getTextAsJSON()); }

/**
 * @fn download
 * @brief downloads data to the user device
 * @param {*} data The data as a string
 * @param {*} fileName The file name to download as
 */
function download(data, fileName)
{
    console.log(data);
    var file = new Blob([data], {type: 'text/plain'});
    
    var a = document.createElement('a');
    a.setAttribute('style', 'display:none;');

    a.href = URL.createObjectURL(file);
    a.download = fileName;

    // Add the child to the document, click on it, and then remove it next event loop cycle
    document.body.appendChild(a);
    a.click();
    setTimeout(function(){
        document.body.removeChild(a);
        window.URL.revokeObjectURL(a.href);
    }, 10)
}

/**
 * @fn saveAsFile
 * @brief saves the list to the user computer
 */
function saveAsFile()
{
    fileName = fileNameInputElement.value;
    download(getTextAsJSONString(), fileName);
    document.getElementById('file-save-modal').style.display = 'none';
}

/**
 * @fn saveBrowserCache
 * @brief saves the current list to the browser cache
 */
function saveBrowserCache()
{
    if(typeof(Storage) !== "undefined")
    {
        localStorage.setItem(SAVED_DATA_KEY, getTextAsJSONString());
    }
    else
    {

    }
}

/**
 * @fn displayLoadedJSON
 * @brief empties the list and loads a new one from the given one
 * @param {*} data An array of ListItem
 */
function displayLoadedJSON(data)
{
    while(list.children.length != 0)
    list.removeChild(list.lastElementChild);

    data.forEach(function (item){
        var copy = listItemTemplate.cloneNode(true);

        var inputs = copy.getElementsByTagName("input");
        inputs[KEY_INDEX].value = item.key;
        inputs[VALUE_INDEX].value = item.value;
        inputs[NEW_VALUE_INDEX].value = item.newValue;

        list.appendChild(copy);
    });
}

/**
 * @fn loadBrowserCache
 * @brief loads the list from the browser cache
 */
function loadBrowserCache()
{
    if(typeof(Storage) !== "undefined")
    {
        var data = localStorage.getItem(SAVED_DATA_KEY);

        if(data == null)
            return;

        data = JSON.parse(data);

        displayLoadedJSON(data);
    }
    else
    {

    }
}

/**
 * @fn openFileSaveDialog
 * @brief opens the file save dialog so a user can download data
 */
function openFileSaveDialog()
{
    fileNameInputElement.value = fileName;
    downloadFileCallback = saveAsFile;
    document.getElementById("downloadButton").innerHTML = DOWNLOAD_TEXT;
    document.getElementById('file-save-modal').style.display = 'block';

}

/**
 * @fn openFileExportDialog
 * @brief opens the dialog for exporting a file
 */
function openFileExportDialog()
{
    fileNameInputElement.value = exportFileName;
    downloadFileCallback = exportFileCallback;
    document.getElementById("downloadButton").innerHTML = EXPORT_TEXT;
    document.getElementById('file-save-modal').style.display = 'block';
}

/**
 * @fn exportFileCallback
 * @brief generates the JSON for exporting and downloads it
 */
function exportFileCallback()
{
    exportFileName = fileNameInputElement.value;
    var obj = {};
    getTextAsJSON().forEach(function (item){
        obj[item.key] = item.newValue;
    });

    download(JSON.stringify(obj), exportFileName);
    document.getElementById('file-save-modal').style.display = 'none';
}

/**
 * @fn listItemClickHandler
 * @brief Sets the selected list item
 * @param {*} listItem The list item element that was clicked.
 */
function listItemClickHandler(listItem)
{
    console.log(listItem.tagName);

    if(selectedItem != null && selectedItem != listItem)
        selectedItem.classList.remove(SELECTED_CLASS);

    selectedItem = listItem;

    if(!selectedItem.classList.contains(SELECTED_CLASS))
        selectedItem.classList.add(SELECTED_CLASS);

}

/**
 * @fn loadFile
 * @brief Reads the file the user selected
 */
function loadFile()
{
    var fileInput = document.getElementById("file-upload-input");

    var file = fileInput.files[0];

    if(file)
    {
        var reader = new FileReader();
        reader.onload = function(e)
        {   
            try
            {
                console.log(e.target.result);
                var json = JSON.parse(e.target.result);

                if(Array.isArray(json))
                    displayLoadedJSON(json);
                else
                    importJSONObject(json);

                document.getElementById("file-upload-modal").style.display = "none";
            }
            catch(syntaxError)
            {
                alert("Internal Error or invalid file.");
            }
        }   
        reader.readAsText(file);
    }   
}

/**
 * @fn importJSONObject
 * @brief loads a JSON object of key-value pairs to the user list 
 * @param {*} data 
 */
function importJSONObject(data)
{
    displayLoadedJSON(Object.keys(data).map(function(key) {return new ListItem(key, data[key], "")}));
}

/**
 * @fn displayUploadDialog
 * @brief displays the upload file dialog
 */
function displayUploadDialog()
{
    document.getElementById("file-upload-modal").style.display = "block";
}

/**
 * @fn clearList
 * Clears the list and adds a blank list item node.
 */
function clearList()
{
    while(list.children.length != 0)
            list.removeChild(list.lastElementChild);

    list.appendChild(listItemTemplate.cloneNode(true));
}