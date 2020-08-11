$(function () {
    let dataTable = {
        dataSource: employees,
        tableSelector: $('tbody'),
        pageController: $('.pagination'),
        recordPerPageSelector: $('.recordsPerPage select'),
        searchSelector: $('.search input'),
        pageSize: parseInt(sessionStorage.getItem("pageSize")) || 10,
        currentPage: 1,
        recordBegin: 0,
        recordEnd: 10,
        pageStep: 2,
        totalsPage: 0,

        init: function () {
            this.initData(this.dataSource);
            this.initEvent(this.dataSource);
        },

        initData: function (data) {
            this.renderRecords(this.currentPage, data);
            this.renderPageControllers(data);
        },

        initEvent: function (data) {
            this.eventChangeRecordPerPage(data);
            this.eventSearchingRecord(data);
            this.eventSortingRecords(data);
        },

        renderRecords: function (page, data) {
            this.recordBegin = (page - 1) * this.pageSize;
            this.recordEnd = page * this.pageSize;
            this.recordPerPageSelector.val(this.pageSize);
            let currentRecords = data.slice(this.recordBegin, this.recordEnd), html = "";
            currentRecords.map((record) => {
                html += `<tr>
                            <td>${record.name}</td>
                            <td>${record.position}</td>
                            <td>${record.office}</td>
                            <td>${record.age}</td>
                            <td>${record.startDate}</td>
                            <td>${record.salary.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</td>
                        </tr>`;
            });
            this.tableSelector.empty().append(html);
            $('.prefix').empty().append(`${this.recordBegin + 1}`);
            $('.suffix').empty().append(this.recordEnd >= data.length ? data.length : this.recordEnd);
            if (data.length === 0) {
                $('.prefix').empty().append("0");
                $('.suffix').empty().append("0");
            }
            $('.total').empty().append(data.length);
        },

        renderPageControllers: function (data) {
            let html = "";
            this.totalsPage = Math.ceil(data.length / this.pageSize);
            html += `<a data-number="1" title="First page">First</a>
                   <a data-number="prev" title="Previous page">Prev</a>`;
            let addPage = (start, end) => {
                for (let i = start; i <= end; i++) {
                    html += `<a data-number="${i}" class="page-index ${this.currentPage === i ? "active" : ""}">${i}</a>`;
                }
            }
            let firstPage = () => {
                html += `<a data-number="1" class="page-index">1</a><i style="float: left; ">...</i>`;
            }
            let lastPage = () => {
                html += `<i style="float: left">...</i><a data-number="${this.totalsPage}" class="page-index">${this.totalsPage}</a>`;
            }
            let pageStart = () => {
                if (this.totalsPage < this.pageStep * 2 + 6) {
                    addPage(1, this.totalsPage);
                } else if (this.currentPage < this.pageStep * 2 + 1) {
                    addPage(1, this.pageStep * 2 + 3)
                    lastPage();
                } else if (this.currentPage > this.totalsPage - this.pageStep * 2) {
                    firstPage();
                    addPage(this.totalsPage - this.pageStep * 2 - 2, this.totalsPage);
                } else {
                    firstPage();
                    addPage(this.currentPage - this.pageStep, this.currentPage + this.pageStep);
                    lastPage();
                }
            }
            pageStart();
            html += `<a data-number="next" title="Next page">Next</a>
                   <a data-number=${this.totalsPage} title="Last page">Last</a>`;
            this.pageController.empty().append(html);
            this.eventChangingPage(data);
        },

        eventChangingPage: function (data) {
            let self = this;
            this.validatePageControllers();
            this.pageController.children("a").click(function () {
                let value = $(this).data("number");
                if ("prev" === value) {
                    value = self.currentPage < 1 ? 1 : self.currentPage - 1;
                } else if ("next" === value) {
                    value = self.currentPage > self.totalsPage ? self.totalsPage : self.currentPage + 1;
                }
                self.currentPage = value;
                self.renderRecords(self.currentPage, data);
                self.renderPageControllers(data);
                self.validatePageControllers();
            });
        },

        validatePageControllers: function () {
            let firstPage = $('[title="First page"]'),
                prevPage = $('[data-number="prev"]'),
                nextPage = $('[data-number="next"]'),
                lastPage = $('[title="Last page"]');
            firstPage.show(); prevPage.show(); nextPage.show(); lastPage.show();
            if (this.currentPage <= 1) {
                prevPage.hide();
                firstPage.hide();
            }
            if (this.currentPage >= this.totalsPage) {
                nextPage.hide();
                lastPage.hide();
            }
        },

        eventChangeRecordPerPage: function (data) {
            this.recordPerPageSelector.on("change", () => {
                sessionStorage.setItem("pageSize", $(".recordsPerPage option:selected").val());
                this.currentPage = 1;
                this.pageSize = parseInt(sessionStorage.getItem("pageSize"));
                this.renderRecords(this.currentPage, data);
                this.renderPageControllers(data);
                this.eventChangingPage(data);
            });
        },

        eventSearchingRecord: function (data) {
            this.searchSelector.keyup(() => {
                let searchValue = this.searchSelector.val();
                searchValue = searchValue.toLowerCase().replace(/ /g, "").trim();
                let dataTemp = data.reduce((dataTemp, record) => {
                    return (record.name.toLowerCase().replace(/ /g, "").trim().search(searchValue) > -1)
                        ? [...dataTemp, record] : dataTemp;
                }, []);
                this.currentPage = 1;
                this.initData(dataTemp);
                this.eventChangingPage(dataTemp);
            });
        },

        eventSortingRecords: function (data) {
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
            $('tr:nth-child(odd) td:first-child').css("background-color", "#f1f1f1");
            $('tr:nth-child(even) td:first-child').css("background-color", "#fafafa");
            $('tr:first-child th').click(function () {
                let order = $(this).data("sort"),
                    key = $(this).data("key"),
                    n = $(this).index() + 1;
                if ("asc" === order) {
                    ascArrow.hide();
                    descArrow.hide();
                    $(this).children(".ascending").show();
                    $(this).data("sort", "desc");
                }
                if ("desc" === order) {
                    ascArrow.hide();
                    descArrow.hide();
                    $(this).children(".descending").show();
                    $(this).data("sort", "asc");
                }
                self.renderRecords(self.currentPage, data.sort(compareValues(key, order)));
                $(`tr:nth-child(odd) td:nth-child(${n})`).css("background-color", "#f1f1f1");
                $(`tr:nth-child(even) td:nth-child(${n})`).css("background-color", "#fafafa");
            });
        },
    }
    dataTable.init();
});