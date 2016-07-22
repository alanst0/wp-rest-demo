function generateProfile(data) {
    var panel = $('#profile-template').clone().attr('id', '');
    panel.find('.panel-title').text(data.title.rendered);
    panel.html(panel.html().replace(/{{([A-Za-z_]+)}}/g, function(_, field) {
        return data.profile_info[field] || '';
    }));
    panel.html(panel.html().replace(/{{([A-Za-z_]+)\|(.*?)}}/g, function(_, field, default_) {
        return data.profile_info[field] || default_;
    }));
    return panel;
}

$(function() {
    var id = 0;

    $('form').on('submit', function(e) {
        e.preventDefault();
        var url = $('#url').val();
        if (!url)
            return;
        // Replace protocol, if any, with "//"
        url = '//' + url.replace(/^(https?:)?\/*/gi, '');
        id++;
        $('<li><a href="#site' + id + '" data-toggle="tab"><button class="close" type="button">&times;</button><span>Loading...</span></a></li>').appendTo($('#tabs'));
        var tabContent = $('<div class="tab-pane" id="site' + id + '"><span class="loading">Loading</span></div>').appendTo($('.tab-content'));
        var tabLink = $("a[href='#site" + id + "']").tab('show');

        $.getJSON(url + '/wp-json', function(data) {
            tabLink.find('span').text(data.name);
        }).fail(function() {
            tabLink.find('span').text('Unknown');
            tabContent.prepend('<div class="alert alert-warning">Could not retrieve site information<a href="#" class="close" data-dismiss="alert">&times;</a></div>');
        });

        $.getJSON(url + '/wp-json/wp/v2/profile', function(data) {
            data.forEach(function(profile) {
                tabContent.append(generateProfile(profile));
            });
        }).fail(function() {
            tabContent.prepend('<div class="alert alert-danger">Could not retrieve profiles<a href="#" class="close" data-dismiss="alert">&times;</a></div>');
        }).complete(function() {
            tabContent.find('.loading').remove();
        });
    });

    $('#tabs').on('click', 'button.close', function(e) {
        e.preventDefault();
        $('#main-tab').tab('show');
        $($(this).parent('a').attr('href')).remove();
        $(this).parent('a').remove();
    });

});
