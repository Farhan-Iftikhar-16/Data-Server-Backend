$(document).ready(function(){
    $.contextMenu({
        selector: '.deque-hierarchical-menu button',
        items: {
            addFile: {
                name: "Add File",
                callback: addFileOrFolder
            },
            addFoler: {
                name: "Add Folder",
                callback: addFileOrFolder
            },
            Delete: {
                name: "Delete",
                callback: deleteFileOrFolder
            }
        },
    });
    $.contextMenu({
        selector: '.deque-hierarchical-menu a',
        items: {
            Open: {
                name: "Open/Edit",
                callback: function (key, opt) {
                    var id = $(this).attr('id');
                    var name = $(this).text();
                    $('.txtFileHeader').text('Editing - "'+name+'"');
                    $.get('/api/v1/getFileContent/'+id, function (response) {
                        $('.bxEditBox').show();
                        $('.bxWelcomeBox').hide();
                        $('.bxInstructionBox').hide();
                        CKEDITOR.instances["fileContent"].setData(response.data.content)
                        $('.btnSaveContent').attr('data-fileid', id);
                    })
                }
            },
            Delete: {
                name: "Delete",
                callback: deleteFileOrFolder
            }
        },
    });
    CKEDITOR.replace("fileContent");
    // CKEDITOR.instances["fileContent"].setData("")
    // setTimeout(function() { 
        // $.get('/menu', function(res){
        //     $('.btxHierarchicalMenu').empty().append(res);
        // })
    // }, 5000)
})
$(document).on('click', '.btnSaveContent', function(e) {
    e.preventDefault();
    var $this = $(this);
    var fileId = $this.attr('data-fileid');
    $('.txtFileHeader').text('');
    if(fileId && fileId != '') {
        var content = CKEDITOR.instances["fileContent"].getData();
        $.post('/api/v1/saveFileContent',{_id:fileId,content: content },function(e){
            alert('Successfully saved');
            $this.attr('data-fileid', '');
            CKEDITOR.instances["fileContent"].setData('')
            $('.bxEditBox').hide();
            $('.bxInstructionBox').show();
        })
    }
})
function deleteFileOrFolder(key, opt) {
    var $this = $(this);
    var r = confirm('Are you sure you want to delete this file?');
    if(r == true) {
        var id = $this.attr('id');
        $.post('/api/v1/delete', {_id: id}, function(e){
            $this.closest('li').remove();
        })
    }
}
$(document).on('click', '.btnAddFolder, .btnAddFile', function(e) {
    var parentId = $(this).attr('id');
    $('#fileNameModal').attr('data-parentid', parentId);
    var type = '';
    if($(this).hasClass('btnAddFolder')) {
        type = 'folder';
    } else {
        type = 'file';
    }
    $('#fileNameModal').attr('data-filetype', type);
    $('#fileNameModal .modal-title').text('Enter '+type+' name');
    $('#fileNameModal').modal('show')
})
function addFileOrFolder (key, opt) {
    var type = 'folder';
    if(key == 'addFile') {
        type = 'file'
    }
    var parentId = $(this).attr('id');
    $('#fileNameModal').attr('data-parentid', parentId);
    $('#fileNameModal').attr('data-filetype', type);
    $('#fileNameModal .modal-title').text('Enter '+type+' name');
    $('#fileNameModal').modal('show')
}
$(document).on('click', '.btnSaveChanges', function(e){
    e.preventDefault();
    // var fileid = $('#fileNameModal').attr('data-fileid');
    var parentId = $('#fileNameModal').attr('data-parentid');
    var fileType = $('#fileNameModal').attr('data-filetype');
    var fileName = $('#textFileFolderName').val();
    $.post('/api/v1/create', {name: fileName, parentId: parentId, fileType: fileType}, function(response) {
        $('#fileNameModal').modal('hide');
        if(response.success) {
            window.location.reload();
        } else {
            alert(response.message || 'Something went wrong');
        }
    })
});
$(document).on('click', '.btnSignUp', function(e) {
    e.preventDefault();
    var data = $('#frmSignup').serialize();
    $.ajax({
        url:'/api/v1/accounts/signup',
        method: 'POST', 
        data: data, 
        success: function(response){
            if(response && response.success) {
                alert(response.message);
                window.location.replace('/login');
            } else {
                alert(response.message || 'Something went wrong');
            }
        },
        error: function(jqXHR, textStatus, errorThrown) {
            alert(jqXHR.responseJSON.message || 'Something went wrong')
        }
    })
})
$(document).on('click', '.btnLogin', function(e) {
    e.preventDefault();
    var data = $('#frmLogin').serialize();
    $.ajax({
        url:'/api/v1/accounts/login',
        method: 'POST', 
        data: data, 
        success: function(response){
            if(response && response.success) {
                window.location.replace('/');
            } else {
                alert(response.message || 'Something went wrong');
            }
        },
        error: function(jqXHR, textStatus, errorThrown) {
            console.log(jqXHR.responseJSON)
            alert(jqXHR.responseJSON.message || 'Something went wrong')
        }
    })
});

$(document).on('click', '.btnSearch', function(e){
    e.preventDefault();
    var text = $('#txtSearch').val();
    searchInMenu(text)
});
$("#txtSearch").on('search', function(e) {
    e.preventDefault();
    var text = $('#txtSearch').val();
    searchInMenu(text)
});
function searchInMenu(text){
    if(text && text !== '') {
        $('.highlight').removeClass('highlight')
        text = text.toLowerCase();
        files.forEach(function lambda(item){
            if(item.name.toLowerCase().includes(text)){
                let el = $('#'+item._id);
                el.addClass('highlight');
                if(el.attr('aria-expanded') == 'false') {
                    el.click();
                }
                var parentId = item.parentId;
                var index= 0;
                while(parentId && parentId != null && index < files.length){
                    // console.log('parentId',parentId);
                    let file = files[index]; 
                  if(file._id == parentId){
                    // console.log('matched parent',file.name) 
                        let el = $('#'+file._id);
                        if(el.attr('aria-expanded') == 'false') {
                            el.click();
                        }
                        parentId = file.parentId;
                        index = 0;
                  }  else {
                    index++;
                  }
                } 
            }
        })
    }
}