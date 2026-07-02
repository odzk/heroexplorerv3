/**
 * Hero explorer big search
 * ------------
 * Version : 0.0.2
 * Website : heroexlorer
 * Author  : HanPhan
 */

(function ($) {
  $.fn.heroExplorerBigSearch = function (options) {
      var THIS = this;

      THIS.serverUrl = 'https://nuvho.heroexplorer.com';
      THIS.apiUrl = 'https://awsapi.heroexplorer.com/api';

      THIS.options = {
          destId: 367
      }
      THIS.itemsPerPage = 8;
      THIS.limit = 100;
      THIS.pageSize = 100;
      THIS.totalPages = 0;
      THIS.listAllProducts = [];
      THIS.listProducts = [];
      THIS.isStopLoadMore = false;
      THIS.breakPaginationEvent = false; // when load more, prevent pagination event

      THIS.ELE = {};
      THIS.CURRENT_SORT;

      THIS.defaultOpts = {
          totalPages: 20
      };

      THIS.data = {};

      // call api get list products
      THIS.getListProducts = function (isLoadMore) {
          THIS.loading();
          var def = $.Deferred();
          $.ajax({
              data: JSON.stringify(THIS.data),
              type: 'POST',
              contentType: 'application/json',
              url: THIS.apiUrl + '/Products/searchForProductsByTextAndCode',
              success: function (response) {
                  THIS.listAllProducts = THIS.listAllProducts.concat(response);
                  THIS.totalPages = Math.round(THIS.listAllProducts.length / THIS.itemsPerPage);

                  if (isLoadMore) { // only for load more
                      THIS.breakPaginationEvent = true;
                      THIS.resetPagination();
                  }

                  $('body').loading('stop');
                  def.resolve(response);
              }
          });
          return def.promise();
      }

      THIS.composePagination = function () {
          $('#hxWidgetBigSearchPagination').twbsPagination({
              totalPages: THIS.totalPages,
              next: 'Next >>',
              prev: '<< Previous',
              firstClass: 'hx-widget-big-search--hidden',
              lastClass: 'hx-widget-big-search--hidden',
              onPageClick: function (event, page) {
                  THIS.onPageClick(event, page);
              }
          });
      }

      THIS.onPageClick = function (event, page) {
          THIS.listProducts = [];
          var start = (page - 1) * THIS.itemsPerPage;
          var end = THIS.itemsPerPage * page;
          THIS.listProducts = THIS.listAllProducts.slice(start, end);
          THIS.composeListProducts();

          if (!THIS.breakPaginationEvent && !THIS.isStopLoadMore && (page === THIS.totalPages || page === THIS.totalPages - 1)) {
              var topX = (THIS.pageSize + 1).toString() + '-' + (THIS.pageSize + THIS.limit).toString();
              THIS.pageSize += THIS.limit;
              THIS.data.topX = topX;
              THIS.loading();
              THIS.getListProducts(true).then(function (response) {
                  if (response.length === 0) {
                      THIS.isStopLoadMore = true;
                      THIS.breakPaginationEvent = true;
                  }
              });
          }
          if (!THIS.isStopLoadMore) {
              THIS.breakPaginationEvent = false;
          }
      }

      THIS.rating = function () {
          $.each($('.hxWidgetBigSearchRating'), function (index, e) {
              $(this).barrating({
                  theme: 'bars-reversed',
                  initialRating: $(this).data('rating'),
                  readonly: true
              });
          })

      }

      THIS.composeMailHtml = function () {
          var html = '<div id="heroExplorerBigSearch">' +
              '<div class="hx-widget-big-search__header">' +
              '<div class="header__search-bg full-fill"></div>' +
              '<div class="header__search-content full-fill">' +
              '<div class="line-information"> <div style="flex: 25%;"><i class="icon-ticket"></i><span>100,000+ Things to Do</span></div><div style="flex: 25%;">' +
              '<i class="icon-award"></i><span>Best Prices</span></div> <div style="flex:auto"> <i class="icon-globe"></i><span>Top Service</span></div></div>'
              +
              '<div id="hxWidgetBigSearchBoxSearch"></div>' +
              '</div>' +
              '</div>' +
              '<div class="hx-widget-big-search__main">' +
              '<div class="main__container">' +
              '<div class="main__container--top">' +
              '<div class="hx-sort">' +
              '<p>Sort by: </p>' +
              '<div class="hx-sort__input-container">' +
              '<input placeholder="Most popular" id="hxWidgetBigSearchInputSort" />' +
              '<img src="' + THIS.serverUrl + '/assets/images/arrow-down.png" class="hx-btn-sort" id="hx-widget-big-search__btn-select"/>' +
              '<ul id="hxWidgetBigSearchListSort" class="hx--list-option">' +
              '<li data-name="Most popular" data-id="TOP_SELLERS">Most popular</li>' +
              '<li data-name="Top rated" data-id="REVIEW_AVG_RATING_D">Top rated</li>' +
              '<li data-name="Price (High - Low)" data-id="PRICE_FROM_D">Price (High - Low)</li>' +
              '<li data-name="Price (Low - High)" data-id="PRICE_FROM_A">Price (Low - High)</li>' +
              '</ul>' +
              '</div>' +
              '</div>' +
              '<ul id="hxWidgetBigSearchPagination" class="hx-pagination pagination-sm"></ul>' +
              '</div>' +
              '<div class="main__container--bottom">' +
              '<div class="hx-widget-big-search__list-products-container">' +
              '<div class="hx-list-products">' +
              '<ul id="hxWidgetBigSearchListProducts"></ul>' +
              '</div>' +
              '<div id="hxWidgetBigSearchBtnViewAll" class="hx__btn-view-all">' +
              '<p>' +
              '<a href="' + THIS.serverUrl + '/list-result/' + THIS.options.destId + '/0/0/">View All</a>' +
              '</p>' +
              '</div>' +
              '</div>' +
              '</div>' +
              '</div>' +
              '</div>' +
              '</div>';
          THIS.html(html);
      }

      THIS.loading = function () {
          var load = $('body').find('#hxWidgetBigSearchLoading');
          if (load.length === 0) {
              var html = '<div id="hxWidgetBigSearchLoading">' +
                  '<div class="hx-widget-big-search-custom-loading">' +
                  '<div class="spinner-three-bounce bounce1" style="background-color: rgb(204, 87, 87);"></div>' +
                  '<div class="spinner-three-bounce bounce2" style="background-color: rgb(204, 87, 87);"></div>' +
                  '<div class="spinner-three-bounce bounce3" style="background-color: rgb(204, 87, 87);"></div>' +
                  '</div>' +
                  '</div>';
              $('body').append(html);
          }
          $('body').loading({
              overlay: $("#hxWidgetBigSearchLoading")
          })
      }

      THIS.composeListProducts = function () {
          var html = '';
          $.each(THIS.listProducts, function (i, e) {
              //console.log(e.thumbnailHiResURL);
              if (!e.thumbnailHiResURL) {
                  e.thumbnailHiResURL = THIS.serverUrl + '/assets/images/no-image.png';
              }
              html += '<li>' +
                  '<div class="hx-product-item">' +
                  '<div class="product-item--top">' +
                  '<a href="' + THIS.serverUrl + '/detail/' + e.code + '"><img src="' + e.thumbnailHiResURL + '"></a>' +
                  '</div>' +
                  '<div class="product-item--bottom">' +
                  '<p class="product-item-title">' +
                  '<a href="' + THIS.serverUrl + '/detail/' + e.code + '">' + e.shortTitle + '</a>' +
                  '</p>' +
                  '<p class="product-item-rate">' +
                  '<select class="hxWidgetBigSearchRating" data-rating="' + e.rating + '">' +
                  '<option value=""></option>' +
                  '<option value="1">1</option>' +
                  '<option value="2">2</option>' +
                  '<option value="3">3</option>' +
                  '<option value="4">4</option>' +
                  '<option value="5">5</option>' +
                  '</select>' +
                  '<span>' + e.reviewCount + ' reviews</span>' +
                  '</p>' +
                  '<p class="product-item-currency-code">' +
                  'From AUD' +
                  '</p>' +
                  '<p class="product-item-price">' +
                  e.priceFormatted +
                  '</p>' +
                  '</div>' +
                  '</div>' +
                  '</li>';
          })

          $('#hxWidgetBigSearchListProducts').html(html);
          THIS.rating();
      }

      THIS.composeBoxSearch = function () {
          THIS.ELE.BOX_SEARCH.heroExplorerSearch();
      }

      THIS.bindEvent = function () {
          THIS.ELE = {
              BTN_VIEW_ALL: $('#hxWidgetBigSearchBtnViewAll'),
              BTN_SEARCH: $('#hxWidgetBigSearchBtnSearch'),
              BTN_SELECT: $('#hx-widget-big-search__btn-select'),
              LIST_SORT: $('#hxWidgetBigSearchListSort'),
              INPUT_SORT: $('#hxWidgetBigSearchInputSort'),
              INPUT_SEARCH: $('#hxWidgetBigSearchInputSearch'),
              BOX_SEARCH: $('#hxWidgetBigSearchBoxSearch')
          }
         

          THIS.search();
          THIS.toggleShowList();
          THIS.onClickSelectOption();
          THIS.composeBoxSearch();

          THIS.ELE.BTN_VIEW_ALL.show();

          // set active for most popular sort
          var currentSort = THIS.ELE.LIST_SORT.children('li')[0];
          THIS.setActive($(currentSort));
      }

      THIS.search = function () {
          THIS.ELE.BTN_SEARCH.click(function () {
              var keyword = THIS.ELE.INPUT_SEARCH.val();
              if (THIS.options.destId > 0) {
                  window.location.href = THIS.serverUrl + "/list-result/" + THIS.options.destId + '/0/0/' + keyword;
              }
          })
      }

      THIS.toggleShowList = function () {
          THIS.ELE.BTN_SELECT.click(function (event) {
              event.stopPropagation();
              if (THIS.ELE.LIST_SORT.css("display") === 'none') {
                  THIS.ELE.LIST_SORT.show();
              } else {
                  THIS.ELE.LIST_SORT.hide();
              }
          })
      }

      THIS.onClickSelectOption = function () {
          THIS.ELE.LIST_SORT.children('li').click(function (event) {
              event.stopPropagation();
              // hide list sort
              THIS.ELE.LIST_SORT.hide();

              // change value of input sort
              THIS.ELE.INPUT_SORT.val($(this).data('name'));
              THIS.setDefault();
              THIS.data = {
                  topX: '1-100',
                destId: THIS.options.destId,
                currencyCode: 'AUD',
                text: "%20",
                searchTypes: ["PRODUCT", "DESTINATION"],
                sortOrder: $(this).data('id')
              };
           
              THIS.loading();
              THIS.getListProducts(false).then(function (response) {
                  if (response.length > 0) {
                      THIS.resetPagination();
                  } else {
                      THIS.isStopLoadMore = true;
                      THIS.breakPaginationEvent = true;
                  }
              })

              // set active
              THIS.setActive($(this));
          })
      }

      THIS.setActive = function (currentSort) {
          if (THIS.CURRENT_SORT) {
              THIS.CURRENT_SORT.removeClass('active');
          }
          THIS.CURRENT_SORT = currentSort;
          THIS.CURRENT_SORT.addClass('active');
      }

      THIS.resetPagination = function () {
          var currentPage = $('#hxWidgetBigSearchPagination').twbsPagination('getCurrentPage');
          $('#hxWidgetBigSearchPagination').twbsPagination('destroy');
          $('#hxWidgetBigSearchPagination').twbsPagination($.extend({}, THIS.defaultOpts, {
              startPage: currentPage,
              totalPages: THIS.totalPages,
              onPageClick: function (event, page) {
                  THIS.onPageClick(event, page);
              }
          }));
      }

      THIS.setDefault = function () {
          THIS.itemsPerPage = 8;
          THIS.limit = 100;
          THIS.pageSize = 100;
          THIS.totalPages = 0;
          THIS.listAllProducts = [];
          THIS.listProducts = [];
          THIS.isStopLoadMore = false;
          THIS.breakPaginationEvent = false;
      }

      THIS.init = function () {
        
          THIS.options = $.extend(THIS.options, options);
          THIS.data = {
              topX: '1-100',
              destId: THIS.options.destId,
              currencyCode: 'AUD',
              text: "%20",
              searchTypes: ["PRODUCT", "DESTINATION"],
              'sortOrder': "TOP_SELLERS"
          };

          THIS.composeMailHtml();
          THIS.getListProducts(false).then(function (response) {
              THIS.composePagination();
              THIS.bindEvent();
          })

      }

      THIS.init();
  };

}(jQuery));



// <div class="line-information" style="
//     display: flex;
//     flex: 100%;
// "> <div style="flex: 25%;"><i class="fa fa-bookmark" style="
//     color: #80B9BF;
// "></i><span> 100,000+ Things to Do</span></div><div style="flex: 25%;"><i class="fa fa-trophy" style="
//     color: #80B9BF;
// "></i><span> Best Prices</span></div> <div style="flex:auto"> <i class="fa fa-globe-europe" style="
//     color: #80B9BF;
// "></i><span> Top Service</span></div></div>