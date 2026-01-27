function componentToHex(c) {
  var hex = c.toString(16);
  return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(r, g, b) {
  return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

function hexToRgb(hex) {
  var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  hex = hex.replace(shorthandRegex, function(m, r, g, b) {
    return r + r + g + g + b + b;
  });

  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)] : null;
}

// alert( hexToRgb("#0033ff").g ); // "51";

// alert( rgbToHex(0, 51, 255) ); // #0033ff

/**
 * Converts an HSL color value to RGB. Conversion formula
 * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
 * Assumes h, s, and l are contained in the set [0, 1] and
 * returns r, g, and b in the set [0, 255].
 *
 * @param   {number}  h       The hue
 * @param   {number}  s       The saturation
 * @param   {number}  l       The lightness
 * @return  {Array}           The RGB representation
 */
function hslToRgb(h, s, l) {
  var r, g, b;

  if (s == 0) {
    r = g = b = l; // achromatic
  } else {
    var hue2rgb = function hue2rgb(p, q, t) {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    }

    var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    var p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}
/**
 * Converts an RGB color value to HSL. Conversion formula
 * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
 * Assumes r, g, and b are contained in the set [0, 255] and
 * returns h, s, and l in the set [0, 1].
 *
 * @param   {number}  r       The red color value
 * @param   {number}  g       The green color value
 * @param   {number}  b       The blue color value
 * @return  {Array}           The HSL representation
 */
function rgbToHsl(r, g, b) {
  r /= 255, g /= 255, b /= 255;
  var max = Math.max(r, g, b),
    min = Math.min(r, g, b);
  var h, s, l = (max + min) / 2;

  if (max == min) {
    h = s = 0; // achromatic
  } else {
    var d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return [h, s, l];
}

function hslToHex(h, s, l) {
  var arr = hslToRgb(h, s, l);
  return rgbToHex(arr[0], arr[1], arr[2]);
}

function hexToHsl(hex) {
  var arr = hexToRgb(hex);
  return rgbToHsl(arr[0], arr[1], arr[2]);
}

function luminanace(r, g, b) {
  var a = [r, g, b].map(function(v) {
    v /= 255;
    return (v <= 0.03928) ?
      v / 12.92 :
      Math.pow(((v + 0.055) / 1.055), 2.4);
  });
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

function contrastCheck(hex1, hex2) {
  var rgb1 = hexToRgb(hex1),
    rgb2 = hexToRgb(hex2),
    val1 = (luminanace(rgb1[0], rgb1[1], rgb1[2]) + 0.05),
    val2 = (luminanace(rgb2[0], rgb2[1], rgb2[2]) + 0.05);
  if (val1 > val2) {
    return (val1 / val2).toFixed(1);
  } else {
    return (val2 / val1).toFixed(1);
  }

}
// minimal recommended contrast ratio is 4.5 or 3 for larger font-sizes

function colorResult(contrast) {
  if (contrast >= 0 && contrast < 3) { // fail
    return 'fail';
  } else if (contrast >= 3 && contrast < 4.5) {
    return 'aa-large';
  } else if (contrast >= 4.5 && contrast < 7) {
    return 'aa';
  } else if (contrast >= 7 && contrast <= 22) {
    return 'aaa';
  }
}
// from lea verou's contrast ratio checker:
var messages = {
	'fail': 'Fails WCAG 2.0 :-(',
	'aa-large': 'Passes AA for large text (above 18pt or bold above 14pt)',
	'aa': 'Passes AA level for any size text and AAA for large text (above 18pt or bold above 14pt)',
	'aaa': 'Passes AAA level for any size text'
};
$('input').on('focusout', function() {
  var pallette = $('#pallette').html(''),
    contrast = $("#contrast").removeAttr('class'),
    bg = $('#bgcolor').val(),
    color = $('#color').val(),
    prevhex = "",
    hsl = hexToHsl(color),
    fullhex = hslToHex(hsl[0], hsl[1], hsl[2]),
    bghsl = hexToHsl(bg),
    bgfullhex = hslToHex(bghsl[0], bghsl[1], bghsl[2]),
    check = contrastCheck(bg, color),
     levelpassed = colorResult(check),
    prevlevel = "",
    recommended,
    levels = $('#levels tbody').html(''),
    re = /(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i;
  $('.first,.last').html('').css('border-color', '#777');
  if (re.test(color) && re.test(bg)) {
    $('body').css({
      'background': bg,
      'color': color
    });
    $('#bgcolor').css({
      'background': color,
      'color': bg
    });
    $('#color').css({
      'background': bg,
      'color': color
    });
    contrast.html(check).addClass(levelpassed);
    $('#messages').html(messages[levelpassed]);
    for (i = 0; i <= 10000; i++) {

      var myl = i / 10000,
        myhex = hslToHex(hsl[0], hsl[1], myl),
        me = $('<li><span></span></li>'),
        span = me.find('span'),
        check = contrastCheck(bg, myhex),
        level = colorResult(check);
      if (prevhex != myhex) {
        span.css('background', myhex).attr('title', myhex); 
        if (prevlevel != level) {
          me.attr('class', level);
          $('<tr class="' + level + '"><th>' + level + ': </th><td class="first" style="border-color:' + myhex + '">' + myhex + '</td></tr>').appendTo('#levels tbody');
          if (prevlevel != "") $('<td class="last" style="border-color:' + prevhex + '">' + prevhex + '</td>').appendTo('#levels tbody .' + prevlevel + ':last');

          if (prevlevel == 'aa' && level == "aa-large") recommended = prevhex;
          else if (level == "aa" && prevlevel == "aa-large") recommended = myhex;
        } else {
          me.removeAttr('class');
        }

        if (myhex == fullhex) {
          // span.css('background', color);
          me.addClass('current');
        }
        if (myhex == bgfullhex) {
          me.addClass('bgcurrent');
        }
        prevlevel = level;
        prevhex = myhex;
        me.appendTo('#pallette');
      }

    }
    $('<td class="last" style="border-color:' + prevhex + '">' + prevhex + '</td>').appendTo('#levels tbody .' + prevlevel + ':last');

    if (levelpassed == "fail" || levelpassed == "aa-large") {
      $('#reco').html(recommended).removeAttr('disabled').css({
        'color': recommended,
        'background': bg
      });
    } else {
      $('#reco').attr('disabled', 'disabled');
    }
  }
});
$('#reco').on('click', function() {
  var rcolor = $(this).text();
  $('#color').val(rcolor).trigger('focusout');
});
$('input').trigger('focusout');