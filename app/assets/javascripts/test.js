$(function() {
    console.log('test');

    $('.directUpload').find("input:file").each(function(i, elem) {
        var fileInput    = $(elem);
        var form         = $(fileInput.parents('form:first'));
        var submitButton = form.find('input[type="submit"]');
        var progressBar  = $("<div class='bar'></div>");
        var barContainer = $("<div class='progress'></div>").append(progressBar);
        fileInput.after(barContainer);
        fileInput.fileupload({
            fileInput:       fileInput,
            url:             '<%= @s3_direct_post.url %>',
            type:            'POST',
            autoUpload:       true,
            formData:         <%= @s3_direct_post.fields.to_json.html_safe %>,
            paramName:        'file', // S3 does not like nested name fields i.e. name="user[avatar_url]"
            dataType:         'XML',  // S3 returns XML if success_action_status is set to 201
            replaceFileInput: false,
            progressall: function (e, data) {
                var progress = parseInt(data.loaded / data.total * 100, 10);
                progressBar.css('width', progress + '%')
                console.log('progress all DONE')
            },
            start: function (e) {
                submitButton.prop('disabled', true);

                progressBar.
                css('background', 'green').
                css('display', 'block').
                css('width', '0%').
                text("Loading...");
                console.log('progress start DONE')
                },
            done: function(e, data) {
                submitButton.prop('disabled', false);
                progressBar.text("Uploading done");

                // extract key and generate URL from response
                var key   = $(data.jqXHR.responseXML).find("Key").text();
                var url   = '//<%= @s3_direct_post.url.host %>/' + key;

                // create hidden field
                var input = $("<input />", { type:'hidden', name: fileInput.attr('name'), value: url })
                form.append(input);
                console.log('progress done DONE')
                },
            fail: function(e, data) {
                submitButton.prop('disabled', false);

                progressBar.
                css("background", "red").
                text("Failed");
                console.log('progress failed')
                }
            });
            });



});