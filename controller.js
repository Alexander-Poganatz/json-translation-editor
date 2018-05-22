var listItemTemplate;
var list;

const KEY_INDEX = 0;
const VALUE_INDEX = 1;
const NEW_VALUE_INDEX = 2;
const SAVED_DATA_KEY = "SaveData";
const DOWNLOAD_TEXT = "Download";
const EXPORT_TEXT = "Export";
var downloadFileCallback = saveAsFile;
var fileName = "*.json";
var exportFileName = "*.json";
var fileNameInputElement;

window.onload = function(e)
{
    console.log("Loaded.");
    list = document.getElementById("list");
    listItemTemplate = list.firstElementChild.cloneNode(true);
    fileNameInputElement = document.getElementById('file-name-input');

    // After variables are initalized, call other functions as needed.
    loadBrowserCache();
}

function addListItem()
{
    list.appendChild(listItemTemplate.cloneNode(true));
}

function ListItem(key, value, newValue)
{
    this.key = key;
    this.value = value;
    this.newValue = newValue;
}

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

function getTextAsJSONString()
{
   return JSON.stringify(getTextAsJSON());
}

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

function saveAsFile()
{
    fileName = fileNameInputElement.value;
    download(getTextAsJSONString(), fileName);
    document.getElementById('file-save-modal').style.display = 'none';
}

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

function loadBrowserCache()
{
    if(typeof(Storage) !== "undefined")
    {
        var data = localStorage.getItem(SAVED_DATA_KEY);

        if(data == null)
            return;

        data = JSON.parse(data);

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
    else
    {

    }
}

function openFileSaveDialog()
{
    fileNameInputElement.value = fileName;
    downloadFileCallback = saveAsFile;
    document.getElementById("downloadButton").innerHTML = DOWNLOAD_TEXT;
    document.getElementById('file-save-modal').style.display = 'block';

}

function openFileExportDialog()
{
    fileNameInputElement.value = exportFileName;
    downloadFileCallback = exportFileCallback;
    document.getElementById("downloadButton").innerHTML = EXPORT_TEXT;
    document.getElementById('file-save-modal').style.display = 'block';
}

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