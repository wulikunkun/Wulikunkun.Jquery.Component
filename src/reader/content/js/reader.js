(function (jQuery, window, document, undefined) {
  function random(start, stop) {
    return parseInt(Math.random() * (stop - start) + start);
  }
  function Reader(ele, options) {
    this.$ele = $(ele);

    this.defaults = {
      data: "",
      width: "15%",
      height: "100%",
      coverUrl: "",
    };

    this.settings = $.extend({}, this.defaults, options);

    this.components = {
      $container: $(
        "<div class='container-fluid'><div class='row' id='container'><div class='col-2'></div></div></div>"
      ),
      $leftPanel: $(
        '<div class="col-2 vh-100 overflow-auto position-relative px-0 shadow-sm bg-white border-right"></div>'
      ),
      $leftPanelNavContainer: $('<nav class="nav-bar"></nav>'),
      $rightPanel: $(
        '<div class="col-6 bg-light vh-100 overflow-auto position-relative px-0"><div class="card min-vh-100 rounded-0 px-5 py-2 border-0 shadow-sm mx-0"></div> </div><div class="col-2"></div>'
      ),
    };

    this.init();
  }

  Reader.prototype = {
    init: function () {
      this.initStyle();
      this.initEvents();
    },
    initStyle: function () {
      /* js文件在哪个页面中执行资源路径就相对于哪个页面 */
      $("head").append(
        "<link href='./content/css/reader.css' rel='stylesheet'/>"
      );
      $("head").append(
        "<link href='./content/css/bootstrap.min.css' rel='stylesheet'/>"
      );
      $("head").append(
        "<link href='./content/css/fontawesome-free-5.13.0-web/css/all.css' rel='stylesheet'/>"
      );

      /* 倒序加载DOM */
      var $dataDom = $(this.settings.data);
      var $hTagDoms = $dataDom.filter("h1,h2,h3,h4,h5,h6");

      for (var i = 0; i < $hTagDoms.length; i++) {
        var currentItem = $hTagDoms[i],
          $currentItem = $(currentItem);
        $currentItem.attr("id", $currentItem.text());
        if (currentItem.tagName == "H1") {
          var $nextLevelItem = $(
            '<a class="nav-link text-dark border-top border-white py-1 text-left px-4" data-level="1" href="#' +
              $currentItem.text() +
              '">' +
              $currentItem.text() +
              "</a>"
          );
          this.components.$leftPanelNavContainer.append($nextLevelItem);
        } else this.GenerateChildLevel(currentItem);
      }

      this.components.$rightPanel.find("div.card").html($dataDom);

      this.components.$leftPanel.append(this.components.$leftPanelNavContainer);
      this.components.$container.children().append(this.components.$leftPanel);
      this.components.$container.children().append(this.components.$rightPanel);

      this.$ele.append(this.components.$container);
    },
    initEvents: function () {
      this.components.$rightPanel
        .find("button[type='button']")
        .on("click", $.proxy(this.GenerateAnswer, this));

      /* 手动控制checkbox的checked特性 */
      this.components.$rightPanel
        .find("input[type='checkbox']")
        .on("click", function () {
          if ($(this).attr("checked") == undefined) {
            $(this).attr("checked", "true");
          } else $(this).removeAttr("checked");
        });
    },
    GenerateChildLevel: function (tagItem) {
      var nextLevelNum = tagItem.tagName[1],
        parentLevelNum = nextLevelNum - 1;

      var $nextLevelItem = $(
        '<a class="nav-link text-dark border-top border-white py-1 text-left px-4 small" href="#' +
          $(tagItem).text() +
          '" data-level="' +
          nextLevelNum +
          '">' +
          "&nbsp;&nbsp;".repeat(parentLevelNum) +
          $(tagItem).text() +
          "</a>"
      );

      /* last是对当前选择器选中的dom集合进行过滤，而不是从当前jquery对象的子元素中进行过滤 */

      var $parentLevel = null;
      if (parentLevelNum == 1) {
        $parentLevel = this.components.$leftPanelNavContainer
          .children("a[data-level='" + parentLevelNum + "']")
          .last();
      } else {
        $parentLevel = this.components.$leftPanelNavContainer
          .find("a[data-level='" + parentLevelNum + "']")
          .last();
      }

      if ($parentLevel.children("i").length == 0) {
        $parentLevel.append(
          '&nbsp;&nbsp;<i class="fa fa-angle-right text-muted d-none" aria-hidden="true"></i>'
        );
        var $nextLevelContainer = $("<div></div>");
        $nextLevelContainer.append($nextLevelItem);
        $parentLevel.after($nextLevelContainer);
      } else {
        $parentLevel.next().append($nextLevelItem);
      }
    },
    GenerateAnswer: function (e) {
      var $copy = $(e.target).parents("form").clone();
      debugger;
      $copy.addClass("mt-3 bordered");
      $copy.css("background-color", "rgb(222 251 236)");
      $copy.find(".form-group").last().remove();
      var $formItems = $copy.find(".form-group");
      for (var i = 0; i < $formItems.length; i++) {
        /* 生成一个1到4之间的任意值作为答案 */
        var answerIndex = random(1, 4);

        var selectedInputsNum = $($formItems[i]).find(
          "input[checked='checked']"
        ).length;
        if (selectedInputsNum == 0) {
          alert("请做完所有题目");
          $(e.target).bind("click");
          return;
        }
        $(e.target).unbind("click");

        var $inputs = $($formItems[i]).find("input");
        for (var j = 0; j < $inputs.length; j++) {
          var $item = $($inputs[j]);
          if (j == answerIndex) {
            $item.attr("checked", "true");
            $item.next().css("color", "red");
          } else $item.attr("disabled", "true");
        }
      }
      // var questions = $$copy.find("input").attr("disabled");
      $(e.target).parents("form").after($copy);
    },
  };

  $.fn.Reader = function (options) {
    return this.each(function () {
      new Reader(this, options);
    });
  };
})(jQuery, document, window);
