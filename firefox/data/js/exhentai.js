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
        displayError('An unknown error occured!');
        resetLoginForm();
        return;
    }
    
    if(r.text.indexOf('Username or password incorrect') != -1 || r.text.indexOf('we could not find a member using those log in details') != -1) {
        displayError('Login Failure!');
        resetLoginForm();
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
        displayError('Login Failure!');
        resetLoginForm();
        return;
    } else {
        setLocalCookie('ipb_session_id', ipb_session_id);
        setLocalCookie('ipb_member_id', ipb_member_id);
        setLocalCookie('ipb_pass_hash', ipb_pass_hash);
        
        //alert('Login successful, we\'re sending you back to the home page now!');
        
        window.location.href = 'http://exhentai.org';
    }
}

function loginToEh() {
    disableLoginForm('Logging in...');
    saveData();
    
    self.port.on('loginToEHResult', loginToEhResult);
    self.port.emit('loginToEH', {username:$('#usernameInput').val(), password:$('#passwordInput').val()});
}

function displayError(e) {
        $('#errorMsg').css('visibility', 'visible').html('<b>Error</b>: ' + e).hide().fadeIn('slow');
}

function disableLoginForm(msg) {
        $('#loginButton').addClass('disabled');
        $('#loginButton').html(msg);
        $('#usernameInput').prop('disabled', true);
        $('#passwordInput').prop('disabled', true);
        $('#saveLogin').prop('disabled', true);
}

function resetLoginForm() {
        $('#loginButton').removeClass('disabled');
        $('#loginButton').html('Sign in');
        $('#usernameInput').prop('disabled', false);
        $('#passwordInput').prop('disabled', false);
        $('#saveLogin').prop('disabled', false);
}

$(function() {
    // Don't know why we'd need this but here it is
    deleteLocalCookie('ipb_session_id');
    deleteLocalCookie('ipb_member_id');
    deleteLocalCookie('ipb_pass_hash');

    // Stinky 404
    document.title = 'ExHentai Easy! ~ Login';
        
    // Append main page content
    var b = $('body');
    b.html(
		'<div align="center">' + 
		'<img src="http://exhentai.org" alt="Sad Panda is Sad"/>' +
                '<div id="errorMsg" class="alert alert-danger" style="visibility:hidden; text-align: left;"><b>Error</b>: Hello!</div>' + 
		'</div>' + 
		'<div class="container">' +
			'<div class="form-signin">' + 
				'<input id="usernameInput" type="text" class="form-control" placeholder="Username" required autofocus>' + 
				'<input id="passwordInput" type="password" class="form-control" placeholder="Password" required>' + 
				'<label class="checkbox">' + 
					'<input id="saveLogin" type="checkbox" value="remember-me"> Remember me' + 
				'</label>' + 
				'<button id="loginButton" class="btn btn-lg btn-success btn-block">Sign in</button>' + 
				'<div align="center" style="margin-top: 12px; font-size: 12px;">' + 
					'<a href="http://haruhichan.com/" target="_blank">Presented by Haruhichan</a><br />' +
					'<a href="http://haruhichan.com/forum/showthread.php?24909-Firefox-ExHentai-Easy-v2-Get-past-sad-panda!" target="_blank">Support - Contact - Donate</a><br />' +
					'<a href="bitcoin:15kJLmbnU4jyY8TcJ4jJ6uBKaHv3PqPm5n">Bitcoin</a>: 15kJLmbnU4jyY8TcJ4jJ6uBKaHv3PqPm5n<br />' + 
					'<a href="litecoin:LLmTuB6xzrS95Z4XhJ6y3UmP8fRsG2tpGa">Litecoin</a>: LLmTuB6xzrS95Z4XhJ6y3UmP8fRsG2tpGa' + 
				'</div>' + 
			'</div>' + 
		'</div>');
    
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
