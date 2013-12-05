// exhentai.js - puromonogatari's module
// author: puromonogatari & seidweise at haruhichan.com 

function saveData() {
    if($('#saveLogin').is(':checked')) {
		self.port.emit('saveUsername', $('#usernameInput').val());
        self.port.emit('savePassword', $('#passwordInput').val());
	} else {
	    self.port.emit('deleteLogin', null);
	}
}

function setLocalCookie(name, value) {
    var exp = new Date();
    
    exp.setMonth(exp.getMonth() + 6);
    
    document.cookie = name + '=' + value + ';expires=' + exp.toGMTString();
}

function deleteLocalCookie(name) {
    document.cookie = name + '=; expires=Thu, 01-Jan-70 00:00:01 GMT;';
}

function loginToEhResult(r) {
    if(r == null || r.text == null) {
        alert('An unknown error (#1) occured while attempting to login to ExHentai. Please report this to @seidweise on http://haruhichan.com!');
        return;
    }
    
    if(r.text.indexOf('Username or password incorrect') != -1 || r.text.indexOf('we could not find a member using those log in details') != -1) {
        alert('Wrong username/password combination, this means you failed to login. Make sure your username or password is correct.');
        return;
    }

    /* The Set-Cookie handling is awful for this shit, so we're going to make it better....*/
    var ipb_member_id = null;
    var ipb_pass_hash = null;
    var ipb_session_id = null;
    
    ipb_session_id = /[0-9a-f]{32}/i.exec(r.headers['Set-Cookie']);
    
    for (var headerName in r.headers) {
        if(headerName.indexOf('ipb_member_id') != -1) {
            ipb_member_id = /ipb_member_id=(0|[1-9][0-9]*);/i.exec(headerName);
            
            if(ipb_member_id != null) {
                ipb_member_id = ipb_member_id[1];
            }
        } else if(headerName.indexOf('ipb_pass_hash') != -1) {
            ipb_pass_hash = /ipb_pass_hash=([0-9a-f]{32});/i.exec(headerName);
            
            if(ipb_pass_hash != null) {
                ipb_pass_hash = ipb_pass_hash[1];
            }
        }
    }
    
    if(ipb_session_id == null || ipb_member_id == null || ipb_pass_hash == null) {
        alert('You failed to login successfully, this could be for a few reasons! Check to make your username and password are correct!');
    } else {
        setLocalCookie('ipb_session_id', ipb_session_id);
        setLocalCookie('ipb_member_id', ipb_member_id);
        setLocalCookie('ipb_pass_hash', ipb_pass_hash);
        
        alert('Login successful, we\'re sending you back to the home page now!');
        
        window.location.href = 'http://exhentai.org';
    }
}

function loginToEh() {
    saveData();
    
    self.port.on('loginToEHResult', loginToEhResult);
    self.port.emit('loginToEH', {username:$('#usernameInput').val(), password:$('#passwordInput').val()});
}

$(function() {
    // Don't know why we'd need this but here it is
    deleteLocalCookie('ipb_session_id');
    deleteLocalCookie('ipb_member_id');
    deleteLocalCookie('ipb_pass_hash');

    // Stinky 404
    document.title = 'ExHentai Login';
    
    // Append fancy stylesheet
    $('head').append(
        '<style>' + 
        'body{font-family:Arial,Helvetica,Verdana,sans-serif;font-size:12px;color:white;background-color:black;}' + 
        'a{color:#80C0FF; text-decoration: none;}' + 
        'a:hover{text-decoration: underline;}' +
        '</style>'
    );
    
    // Append main page content
    $('body').html(
        "<div align=\"center\">" + 
            "<font style=\"color:red;\">ExHentai Easy v2</font> for Firefox by <a href=\"http://haruhichan.com\">Haruhichan</a>!<br /><br />" + 
            "<div><a href=\"http://haruhichan.com/forum/showthread.php?24909-ExHentai-Easy-v2\">Support - Contact - Donate</a></div>" +
            "<a href=\"https://twitter.com/seidweise\" alt=\"Dev: seidweise on twitter!\">@seidweise</a> <a href=\"https://twitter.com/thereals0beit\" alt=\"Dev: s0beit on twitter!\">@thereals0beit</a><br/><br/>" +
            "<a href=\"http://haruhichan.com\"><img src=\"http://exhentai.org/\" alt=\"Sad panda be sad, son\"></a><br /><br />" + 
            "Enter your e-hentai login information below, if you don't have an account on their forums just " + 
            "<a href=\"http://forums.e-hentai.org/index.php?act=Reg&CODE=00\" target=\"_blank\">click this link</a> to register for one!<br /><br />" +
            "<table border=\"0\" width=\"20%\">" + 
                "<tr>" + 
                    "<td width=\"20%\">Login</td>" + 
                    "<td width=\"80%\"><input type=\"text\" id=\"usernameInput\" style=\"width: 100%;\"></td>" +
                "</tr>" + 
                "<tr>" + 
                    "<td>Password</td>" + 
                    "<td><input type=\"password\" id=\"passwordInput\" style=\"width: 100%;\"></td>" +
                "</tr>" + 
                "<tr>" + 
                    "<td>Save Details?</td>" + 
                    "<td><input type=\"checkbox\" id=\"saveLogin\"></td>" +
                "</tr>" + 
                "<tr>" + 
                    "<td></td><td><input id=\"loginButton\" type=\"button\" value=\"Login to ExHentai\" style=\"width:101%;\"></td>" + 
                "</tr>" + 
            "</table>" + 
        "</div>"
    );
    
    $('#loginButton').bind('click', loginToEh);
    
    self.port.on('obtainUsername', function(payload) {
        if(payload != null) {
            $('#usernameInput').val(payload);
        }
    });
    
    self.port.on('obtainPassword', function(payload) {
        if(payload != null) {
            $('#passwordInput').val(payload);
        }
    });
    
    self.port.emit('giveUsername', null);
    self.port.emit('givePassword', null);
});