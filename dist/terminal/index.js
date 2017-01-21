
//Global variables
var commandList = [{
    name: 'cat',
    description: 'cat [filename] will print the contents of that file.'
}, {
    name: 'clear',
    description: 'clear all text in the terminal.'
}, {
    name: 'help',
    description: 'list possible terminal commands.'
}, {
    name: 'ls',
    description: 'list all files in the current directory.'
}, {
    name: 'man',
    description: 'describe a file, but you know that already don\'t you?'
}, {
    name: 'ps',
    description: 'list the current processes'
}, {
    name: 'mkdir',
    description: 'create a new directory'
}, {
    name: 'cd',
    description: 'change the working directory'
}, {
    name: 'touch',
    description: 'touch [filename] creates a blank file'
}]
var manDescriptions = [];

var aboutFile = new File('about.txt', 'This is an experiment to see how much of the linux terminal can be replicated using only Javascript/Jquery/Html/Css.');

var allFiles = ['about.txt'];
var user = 'root@sm:/$';
var commandHistory = [];
var backgroundColorList = ['#141414', '#7F2F2A', '#66CC76', '#5E2957', '#52A7FF', '#CCC045'];
var commandIndex = -1;

var currentDirectory = new Directory('root', [aboutFile], null, true);

function Directory(name, contents, previous) {
    this.name = name;
    this.contents = contents;
    this.previous = previous;
    this.isDir = true;
}

function File(name, content) {
    this.name = name;
    this.isDir = false;
    this.content = content;
}

//Detect the current browser for the 'ps' command
var currentBrowser = function () {
    var is_chrome = navigator.userAgent.indexOf('Chrome') > -1;
    var is_explorer = navigator.userAgent.indexOf('MSIE') > -1;
    var is_firefox = navigator.userAgent.indexOf('Firefox') > -1;
    var is_safari = navigator.userAgent.indexOf("Safari") > -1;
    var is_edge = navigator.userAgent.indexOf("Edge") > -1;
    var is_opera = navigator.userAgent.toLowerCase().indexOf("op") > -1;
    if (is_chrome && is_safari && is_edge) {
        is_chrome = false;
        is_safari = false;
    } else if ((is_chrome) && (is_safari)) {
        is_safari = false;
    } else if ((is_chrome) && (is_opera)) {
        is_chrome = false;
    }
    if (is_chrome) {
        return 'Chrome';
    } else if (is_explorer) {
        return 'Internet Explorer';
    } else if (is_firefox) {
        return 'Firefox';
    } else if (is_safari) {
        return 'Safari';
    } else if (is_edge) {
        return 'Edge';
    } else if (is_opera) {
        return 'Opera';
    } else {
        return 'Browser';
    }
}

//Jquery initializers
$(document).ready(function () {
    function Directory(name, contents, previous) {
        this.name = name;
        this.contents = contents;
        this.previous = previous;
        this.isDir = true;
    }
    //Issues with IE showing the input when opacity at 0, so we add it when the section is clicked
    //Make it more realistic, anywhere they click in the terminal will focus the text field.
    $("#terminal").click(function () {
        $("#terminalInput").focus();
    })

    //Parse and execute a command from the terminal
    function sendCommand(input) {

     $.ajax({
         url: 'https://' + ip + ':' + port + '/system/ssh',
         type: 'POST',
         data : JSON.stringify({ key: sessionStorage.getItem("API_KEY"), cmd: input }),
         success: function (output) {
            console.log(output);
            printToOutput(output); 
            $("#terminalInput").focus();
        },
        error: function () {
            console.log('Error')
            //$(location).attr('href', 'pages/login.html')
        }
    });

     var command = input.split(' ')[0];
     var secondary = input.split(' ')[1];
     if (input === 'ls -la' || input === 'ls -a' || input === 'ls -all' || input === 'ls -l') {
        printAllFiles();
        return;
    }
    switch (command) {
        case '':
        updateInput();
        break;
            default:
            printToOutput('Invalid command \"' + command + '\"');
        }
    }

    function directoryContains(entity) {
        for (var i = 0; i < currentDirectory.contents.length; i++) {
            var entity = currentDirectory.contents[i];
            if (entity.name == entity) {
                return true;
            }
        }
        return false;
    }

    function updateInput() {
        replaceInput();
        addInput();
    }


    function printToOutput(string) {
        replaceInput();
        $("#terminalOutput").append(string + '<br>');
        addInput();
    }

    //Unlock the page, congratulations!
    function unlockPage() {
        $('#downArrow').css('opacity', '0');
        $('#downArrow').css('display', 'block');
        $('#downArrow').animate({
            opacity: 1
        })
        replaceInput();
        addInput();
    }

    //Print out the description of a command
    function man(input) {
        if (commandList.indexOf(input) > -1) {
            replaceInput();
            $("#terminalOutput").append('"' + input + '"' + '  ' + manDescriptions[input] + '<br>');
            addInput();
        } else {
            replaceInput();
            $("#terminalOutput").append('"' + input + '"' + '  is not a valid command, try typing "help" for options.<br>');
            addInput();
        }
    }

    //Clear the terminal
    //Need to have this save output, and just add x amount of spaces
    function clear() {
        replaceInput();
        $("#terminalOutput").empty();
        addInput();
    }

    //Print the given file, usually used with "cat"
    function printFile(file) {
        for (var i = 0; i < currentDirectory.contents.length; i++) {
            var entity = currentDirectory.contents[i];
            if (entity.name == file && !entity.isDir) {
                printToOutput(entity.content);
                return;
            }
        }
        printToOutput('"' + file + '"' + ' is an invalid file name or a directory.  Try typing "ls".');
    }

    //Used for "help", prints the valid terminal commands
    function printList(list) {
        replaceInput();
        list.forEach(function (result) {
            $("#terminalOutput").append(result + '<br>');
        })
        addInput();
    }

    //Used for "ls", prints the files in the current directory
    function printFiles() {
        replaceInput();
        currentDirectory.contents.forEach(function (file) {
            $("#terminalOutput").append(file.name + '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;');
        })
        $("#terminalOutput").append('<br>');
        addInput();
    }

    //Used for "ls -a/la/all", prints all files including hidden ones
    function printAllFiles() {
        replaceInput();
        currentDirectory.contents.forEach(function (file) {
            $("#terminalOutput").append(file.name + '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;');
        })
        $("#terminalOutput").append('<br>');
        addInput();
    }

    //Remove the input and add the input value to the output field
    function replaceInput() {
        var value = $("#terminalInput").val();
        $("#terminalInput").remove();
        $("#terminalOutput").append(value + '<br>');
    }

    //Add a new input to the terminal
    function addInput() {
        //reset the commandIndex
        commandIndex = -1;
        $("#terminalOutput").append(user + ' <input id="terminalInput" spellcheck="false"></input>');
        //Delaying for IE
        //stupid IE
        /*setTimeout(function () {
            $("#terminalInput").focus();
        }, 10);*/

        //Add click handlers for terminal input
        $("#terminalInput").keydown(function (e) {
            var command = $("#terminalInput").val();
            if (e.keyCode == 13) {
                sendCommand(command);
                if (commandHistory.indexOf(command) === -1) {
                    commandHistory.unshift(command);
                    commandIndex = -1;
                }
            } else if (e.keyCode == 9) {
                e.preventDefault();
                autoCompleteInput(command);
            } else if (e.keyCode == 38 && commandIndex != commandHistory.length - 1) {
                e.preventDefault();
                commandIndex++;
                $("#terminalInput").val(commandHistory[commandIndex]);
            } else if (e.keyCode == 40 && commandIndex > -1) {
                e.preventDefault();
                commandIndex--;
                $("#terminalInput").val(commandHistory[commandIndex]);
            } else if (e.keyCode == 40 && commandIndex <= 0) {
                e.preventDefault();
                $("#terminalInput").val('');
            } else if (e.keyCode == 67 && e.ctrlKey) {
                $("#terminalInput").val(command + '^C');
                replaceInput();
                addInput();
            }
        });
    }

    //Used for tabbing, will complete the valid command
    function autoCompleteInput(command) {
        var command = $("#terminalInput").val();
        var input = $("#terminalInput").val().split(' ');
        var validList = [];
        var fileList = input[0] === 'man' ? commandList : currentDirectory.contents

        //Display valid options for a given command
        if (input.length === 2 && input[1] != "") {
            fileList.forEach(function (file) {
                if (file.name.substring(0, input[1].length) === input[1]) {
                    validList.push(file.name);
                }
            })
            if (validList.length > 1) {
                replaceInput();
                validList.forEach(function (option) {
                    $('#terminalOutput').append(option + '   ');
                })
                $('#terminalOutput').append('<br>');
                addInput();
                $("#terminalInput").val(command);
            } else if (validList.length === 1) {
                $("#terminalInput").val(
                    command +
                    validList[0].substring(input[1].length, validList[0].length));
            }
        } else if (command.length) {
            //Else if there is a command, print/finish all valid commands
            commandList.forEach(function (option) {
                if (option.name.substring(0, input[0].length) === input[0]) {
                    validList.push(option.name);
                }
            })
            if (validList.length > 1) {
                replaceInput();
                validList.forEach(function (option) {
                    $('#terminalOutput').append(option + '   ');
                })
                $('#terminalOutput').append('<br>');
                addInput();
                $("#terminalInput").val(command);
            } else if (validList.length === 1) {
                $("#terminalInput").val(
                    command +
                    validList[0].substring(input[0].length, validList[0].length));
            }
        }
    }
    addInput();
});
