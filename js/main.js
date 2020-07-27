$(function () {
    let dataTable = {
        tableSelector: $('tbody'),
        pageController: $('.pagination'),
        dataSource: employees,
        totalRecords: employees.length,
        recordPerPageSelector: $('.recordsPerPage select'),
        searchSelector: $('.search input'),
        pageSize: parseInt(sessionStorage.getItem("pageSize")) || 10,
        currentPage: 1,
        recordBegin: 0,
        recordEnd: 10,
        totalsPage: 0,

        init: function () {
            this.initData();
            this.initEvent();
            this.bindEventSearchingRecord();
            this.bindEventSortingRecords();
        },

        initEvent: function () {
            this.bindEventChangeRecordPerPage();
            this.bindEventChangingPage();
        },

        initData: function () {
            this.renderRecords(this.currentPage);
            this.renderPageControllers();
        },

        setCurrentPage: function (currentPage) {
            this.currentPage = currentPage;
        },

        setRecordBegin: function (recordBegin) {
            this.recordBegin = recordBegin;
        },

        setRecordEnd: function (recordEnd) {
            this.recordEnd = recordEnd;
        },

        setPageSize: function (pageSize) {
            this.pageSize = pageSize;
        },

        renderRecords: function (page) {
            this.setRecordBegin((page - 1) * this.pageSize);
            this.setRecordEnd(page * this.pageSize);
            this.recordPerPageSelector.val(this.pageSize);
            let currentRecords = this.dataSource.slice(this.recordBegin, this.recordEnd);
            this.tableSelector.empty();
            currentRecords.map((record) => {
                return this.tableSelector.append(`<tr>
                                           <td>${record.name}</td>
                                           <td>${record.position}</td>
                                           <td>${record.office}</td>
                                           <td>${record.age}</td>
                                           <td>${record.startDate}</td>
                                           <td>${record.salary.toLocaleString('en-US', {style: 'currency', currency: 'USD'})}</td>
                                           </tr>`);
            });
            let prefix = $('.prefix'), suffix = $('.suffix');
            prefix.empty().append(String(this.recordBegin + 1));
            this.currentPage === this.totalsPage ? suffix.empty().append(String(this.totalRecords)) : suffix.empty().append(String(this.recordEnd));
            if (this.totalRecords === 0) { prefix.empty().append(String(0)); suffix.empty().append(String(0)); }
            $('.total').empty().append(String(this.totalRecords));
        },

        renderPageControllers: function () {
            let html = "";
            this.pageController.empty();
            this.totalsPage = Math.ceil(this.totalRecords / this.pageSize);
            html+=`<a data-number="1" title="First page">First</a>
                   <a data-number="prev" title="Previous page">Prev</a>`;
            for (let i = 1; i <= this.totalsPage; i++) {
                html += `<a data-number="${i}" class="page-index">${i}</a>`;
            }
            html+=`<a data-number="next" title="Next page">Next</a>
                   <a data-number=${this.totalsPage} title="Last page">Last</a>`;
            this.pageController.append(html);
        },

        bindEventChangingPage: function() {
            let self = this;
            this.validatePageControllers();
            this.pageController.children().click(function () {
                let value = $(this).data("number");
                if ("prev" === value) {
                    value = self.currentPage < 1 ? 1 : self.currentPage - 1;
                } else if ("next" === value) {
                    value = self.currentPage > self.totalsPage ? self.totalsPage : self.currentPage + 1;
                }
                self.setCurrentPage(value);
                self.validatePageControllers();
                self.renderRecords(self.currentPage);
            });
        },

        validatePageControllers: function() {
            let firstPage = $('[title="First page"]'),
                prevPage = $('[data-number="prev"]'),
                nextPage = $('[data-number="next"]'),
                lastPage = $('[title="Last page"]'),
                pagesIndex = $('.page-index');
            firstPage.show(); prevPage.show(); nextPage.show(); lastPage.show();
            if (this.currentPage <= 1){
                prevPage.hide(); firstPage.hide();
            }
            if (this.currentPage >= this.totalsPage) {
                nextPage.hide(); lastPage.hide();
            }
            pagesIndex.removeClass("active").eq(this.currentPage - 1).addClass("active");
        },

        bindEventChangeRecordPerPage: function() {
            let self = this;
            this.recordPerPageSelector.on("change", function () {
                sessionStorage.setItem("pageSize", $(".recordsPerPage option:selected").val());
                self.setCurrentPage(1);
                self.setPageSize(parseInt(sessionStorage.getItem("pageSize")));
                self.renderRecords(self.currentPage);
                self.renderPageControllers();
                self.bindEventChangingPage();
            });
        },

        bindEventSearchingRecord: function() {
            let self = this;
            this.searchSelector.keyup(function() {
                let searchValue = self.searchSelector.val();
                searchValue = searchValue.toLowerCase().replace(/ /g,"").trim();
                let employeesTemp = employees.reduce((employeesTemp, employee) => {
                    return (employee.name.toLowerCase().replace(/ /g,"").trim().search(searchValue) > -1)
                        ? [...employeesTemp, employee] : employeesTemp;
                }, []);
                self.dataSource = employeesTemp;
                self.totalRecords = employeesTemp.length;
                self.setCurrentPage(1);
                self.initData();
                self.bindEventChangingPage();
            });
        },

        bindEventSortingRecords: function () {
            function compareValues(key, order = "asc") {
                return function innerSort(a, b) {
                    // Kiểm tra xem key của mỗi object có tồn tại không.
                    if (!a.hasOwnProperty(key) || !b.hasOwnProperty(key)) { return 0; }
                    const varA = (typeof a[key] === "string") ? a[key].toUpperCase() : a[key];
                    const varB = (typeof b[key] === "string") ? b[key].toUpperCase() : b[key];
                    let comparison = 0;
                    if (varA > varB) { comparison = 1; }
                    if (varA < varB) { comparison = -1; }
                    return ((order === "desc") ? (comparison * -1) : comparison);
                };
            }
            let self = this, ascArrow = $(".ascending"), descArrow = $(".descending");
            ascArrow.hide(); descArrow.hide();
            $('tr:first-child th:first-child .ascending').show();
            $('tr:nth-child(odd) td:first-child').css("background-color","#f1f1f1");
            $('tr:nth-child(even) td:first-child').css("background-color","#fafafa");
            $('tr:first-child th').click(function () {
                let order = $(this).data("sort"),
                    key = $(this).data("key"),
                    n = $(this).index() + 1;
                if("asc" === order) {
                    ascArrow.hide(); descArrow.hide();
                    $(this).children(".ascending").show();
                    $(this).data("sort", "desc");
                }
                if("desc" === order) {
                    ascArrow.hide(); descArrow.hide();
                    $(this).children(".descending").show();
                    $(this).data("sort", "asc");
                }
                self.dataSource.sort(compareValues(key, order));
                self.renderRecords(self.currentPage);
                $(`tr:nth-child(odd) td:nth-child(${n})`).css("background-color","#f1f1f1");
                $(`tr:nth-child(even) td:nth-child(${n})`).css("background-color","#fafafa");
            });
        },
    }
    dataTable.init();
})