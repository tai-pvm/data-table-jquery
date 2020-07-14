$(function () {
    let dataTable = {
        tableSelector: $('tbody'),
        pageController: $('.pagination'),
        dataSource: employees,
        recordPerPageSelector: $('.recordsPerPage'),
        totalRecords: employees.length,
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
        },

        initData: function () {
            this.renderRecords(this.dataSource);
            this.renderPageControllers();
        },

        renderRecords: function (data) {
            let begin = (this.currentPage - 1) * this.perPage;
            let end = this.currentPage * this.perPage;
            this.recordPerPageSelector.val(this.perPage);
            this.tableSelector.empty();
            data.map((record, index) => {
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
            $(".begin").empty().append(begin + 1);
            this.currentPage === this.totalsPage ? $(".end").empty().append(this.totalRecords) : $('.end').empty().append(end);
            $(".data-length").empty().append(this.totalRecords);
        },

        renderPageControllers: function () {
            let html = '';
            this.pageController.empty();
            this.totalsPage = Math.ceil(this.totalRecords / this.perPage);
            html+=`<a data-id="first" title="First page">First</a>
                   <a data-id="prev" title="Previous page">Prev</a>`;
            for (let i = 1; i <= this.totalsPage; i++) {
                html += `<a data-id="${i}" class="page-index">${i}</a>`;
            }
            html+=`<a data-id="next" title="Next page">Next</a>
                   <a data-id="last" title="Last page">Last</a>`;
            this.pageController.append(html);
        },

        setCurrentPage: function (currentPage) {
            this.currentPage = currentPage;
        },

        setPerPage: function (perPage) {
            this.perPage = perPage;
        },

        bindEventChangingPage() {
            let self = this,
                firstPage = $("[data-id='first']"),
                prevPage = $("[data-id='prev']"),
                nextPage = $("[data-id='next']"),
                lastPage = $("[data-id='last']"),
                pagesIndex = $(".page-index");
            if (this.currentPage <= 1) {
                prevPage.hide();
                firstPage.hide();
            } else if (this.currentPage >= this.totalsPage) {
                nextPage.hide();
                lastPage.hide();
            }
            pagesIndex.eq(self.currentPage - 1).addClass("active");
            this.pageController.children().on("click", function () {
                let value = $(this).data("id");
                switch (value) {
                    case "first":
                        self.setCurrentPage(1);
                        break;
                    case "prev":
                        self.setCurrentPage(self.currentPage - 1);
                        if (self.currentPage <= 1) {
                            self.setCurrentPage(1);
                        }
                        break;
                    case "next":
                        self.setCurrentPage(self.currentPage + 1);
                        if (self.currentPage >= self.totalsPage) {
                            self.setCurrentPage(self.totalsPage);
                        }
                        break;
                    case "last":
                        self.setCurrentPage(self.totalsPage);
                        break;
                    default:
                        self.setCurrentPage(value);
                        break;
                }
                self.validatePageControllers();
                self.renderRecords(self.dataSource);
            })
        },

        validatePageControllers() {
            let self = this,
                firstPage = $("[data-id='first']"),
                prevPage = $("[data-id='prev']"),
                nextPage = $("[data-id='next']"),
                lastPage = $("[data-id='last']"),
                pagesIndex = $('.page-index');
            pagesIndex.removeClass("active").eq(self.currentPage - 1).addClass("active");
            firstPage.show();
            prevPage.show();
            nextPage.show();
            lastPage.show();
            if (self.currentPage <= 1){
                prevPage.hide();
                firstPage.hide();
            } else if (self.currentPage >= self.totalsPage) {
                nextPage.hide();
                lastPage.hide();
            }
        },

        bindEventChangeRecordPerPage() {
            let self = this;
            this.recordPerPageSelector.on("change", function () {
                sessionStorage.setItem('perPage', $(".recordsPerPage option:selected").val());
                self.setCurrentPage(1);
                self.setPerPage(parseInt(sessionStorage.getItem('perPage')));
                self.renderRecords(self.dataSource);
                self.renderPageControllers();
                self.bindEventChangingPage();
            });
        },
    }

    dataTable.init();
})

