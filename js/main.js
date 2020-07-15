$(function () {
    let dataTable = {
        tableSelector: $('tbody'),
        pageController: $('.pagination'),
        dataSource: employees,
        recordPerPageSelector: $('.recordsPerPage select'),
        searchSelector: $('.search input'),
        perPage: parseInt(sessionStorage.getItem('perPage')) || 5,
        currentPage: 1,
        totalsPage: 0,

        init: function () {
            this.initData();
            this.initEvent();
        },

        initEvent: function () {
            this.bindEventChangeRecordPerPage();
            this.bindEventChangingPage();
            this.bindEventSearchingRecord();
        },

        initData: function () {
            this.renderRecords(this.currentPage);
            this.renderPageControllers();
        },

        renderRecords: function (data) {
            let begin = (data - 1) * this.perPage,
                end = data * this.perPage,
                totalRecords = employees.length;
            this.recordPerPageSelector.val(this.perPage);
            this.tableSelector.empty();
            this.dataSource.map((record, index) => {
                if (index >= begin && index < end) {
                    this.tableSelector.append(`<tr>
                                           <td>${record.name}</td>
                                           <td>${record.position}</td>
                                           <td>${record.office}</td>
                                           <td>${record.age}</td>
                                           <td>${record.startDate}</td>
                                           <td>${record.salary}</td>
                                           </tr>`);
                }
            })
            $(".begin").empty().append(String(begin + 1));
            this.currentPage === this.totalsPage ? $(".end").empty().append(String(totalRecords)) : $('.end').empty().append(String(end));
            $(".data-length").empty().append(String(totalRecords));
        },

        renderPageControllers: function () {
            let html = '', totalRecords = employees.length;
            this.pageController.empty();
            this.totalsPage = Math.ceil(totalRecords / this.perPage);
            html+=`<a data-id="1" title="First page">First</a>
                   <a data-id="prev" title="Previous page">Prev</a>`;
            for (let i = 1; i <= this.totalsPage; i++) {
                html += `<a data-id="${i}" class="page-index">${i}</a>`;
            }
            html+=`<a data-id="next" title="Next page">Next</a>
                   <a data-id=${this.totalsPage} title="Last page">Last</a>`;
            this.pageController.append(html);
        },

        setCurrentPage: function (currentPage) {
            this.currentPage = currentPage;
        },

        setPerPage: function (perPage) {
            this.perPage = perPage;
        },

        bindEventChangingPage() {
            let self = this;
            this.renderRecords(this.currentPage);
            this.validatePageControllers();
            this.pageController.children().click(function () {
                let value = $(this).data("id");
                if (value === 'prev') {
                    self.currentPage < 1 ? value = 1 : value = self.currentPage - 1;
                } else if (value === 'next') {
                    self.currentPage > self.totalsPage ? value = self.totalsPage : value = self.currentPage + 1;
                }
                self.setCurrentPage(value);
                self.validatePageControllers();
                self.renderRecords(self.currentPage);
            })
        },

        validatePageControllers() {
            let firstPage = $("[title='First page']"),
                prevPage = $("[data-id='prev']"),
                nextPage = $("[data-id='next']"),
                lastPage = $("[title='Last page']"),
                pagesIndex = $('.page-index');
            firstPage.show();
            prevPage.show();
            nextPage.show();
            lastPage.show();
            if (this.currentPage <= 1){
                prevPage.hide();
                firstPage.hide();
            } else if (this.currentPage >= this.totalsPage) {
                nextPage.hide();
                lastPage.hide();
            }
            pagesIndex.removeClass("active").eq(this.currentPage - 1).addClass("active");
        },

        bindEventChangeRecordPerPage() {
            let self = this;
            this.recordPerPageSelector.on("change", function () {
                sessionStorage.setItem('perPage', $(".recordsPerPage option:selected").val());
                self.setCurrentPage(1);
                self.setPerPage(parseInt(sessionStorage.getItem('perPage')));
                self.renderRecords(self.currentPage);
                self.renderPageControllers();
                self.bindEventChangingPage();
            });
        },

        bindEventSearchingRecord() {
            let self = this, searchValue = '';
            this.searchSelector.keyup(function () {
                searchValue = self.searchSelector.val();
                console.log(searchValue);
            });
        }
    }

    dataTable.init();
})