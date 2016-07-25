function generateProfileRow(panel, col1, col2) {
    $('<tr>').append($('<td>').append(col1)).append($('<td>').append(col2)).appendTo(panel.find('table'));
}

function generateProfile(data) {
    var panel = $('#profile-template').clone().attr('id', '');
    panel.find('.panel-title').html(data.title.rendered || '<em>No title</em>');
    panel.html(panel.html().replace(/{{([A-Za-z_]+)}}/g, function(_, field) {
        return data.profile_info[field] || '';
    }));
    panel.html(panel.html().replace(/{{([A-Za-z_]+)\|(.*?)}}/g, function(_, field, default_) {
        return data.profile_info[field] || default_;
    }));
    if (data.profile_info.photo) {
        panel.find('img').attr('src', data.profile_info.photo);
    }
    if (data.profile_info.website_group && data.profile_info.website_group.length) {
        var list = $('<ul>');
        $.each(data.profile_info.website_group, function(_, site) {
            $('<li>').append($('<a>').text(site.website_title).attr('href', site.website_url)).appendTo(list);
        })
        generateProfileRow(panel, 'Websites', list);
    }
    return panel;
}

function getHistory() {
    var history = [];
    try {
        history = JSON.parse(localStorage.history);
    }
    catch(e) {}
    return history;
}

function saveHistory(history) {
    localStorage.history = JSON.stringify(history);
}

function displayHistory() {
    var history = getHistory();
    if (history.length) {
        $('#history').show().find('ul').html('');
        $.each(history, function(_, url) {
            $('<li>').append($('<a>').text(location.protocol + url).attr('href', url)).appendTo('#history ul');
        });
    }
    else {
        $('#history').hide();
    }
}
$(displayHistory);

$(function() {
    var id = 0;

    $('form').on('submit', function(e) {
        e.preventDefault();
        var url = $('#url').val();
        if (!url)
            return;
        // Replace protocol, if any, with "//"
        url = '//' + url.replace(/^(https?:)?\/*/gi, '');

        var history = getHistory();
        if (history.indexOf(url) != -1) {
            history.splice(history.indexOf(url), 1);
        }
        history.unshift(url);
        saveHistory(history);
        displayHistory();

        id++;
        $('<li><a href="#site' + id + '" data-toggle="tab"><button class="close" type="button">&times;</button><span>Loading...</span></a></li>').appendTo($('#tabs'));
        var tabContent = $('<div class="tab-pane" id="site' + id + '"><span class="loading">Loading</span></div>').appendTo($('.tab-content'));
        var tabLink = $("a[href='#site" + id + "']").tab('show');

        $.getJSON(url + '/wp-json', function(data) {
            tabLink.find('span').text(data.name);
        }).fail(function() {
            tabLink.find('span').text('Unknown');
            tabContent.prepend('<div class="alert alert-warning">Could not retrieve site information</div>');
        });

        $.getJSON(url + '/wp-json/wp/v2/profile', function(data) {
            data.forEach(function(profile) {
                tabContent.append(generateProfile(profile));
            });
            if (!data.length) {
                tabContent.prepend('<div class="alert alert-info">No profiles found</div>');
            }
        }).fail(function() {
            tabContent.prepend('<div class="alert alert-danger">Could not retrieve profiles</div>');
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

    $('#history h3 .btn').click(function() {
        saveHistory([]);
        displayHistory();
    });

    $('#history').on('click', 'a', function(e) {
        e.preventDefault();
        $('input#url').val($(this).attr('href'));
        $('form').submit();
    });

});
