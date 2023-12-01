                        document.addEventListener("DOMContentLoaded", function () {
                                        const responLink = document.querySelector(".respon");
                                        const activate = document.querySelectorAll(".respondua");

                                        if (responLink) {
                                            responLink.addEventListener("click", function (event) {
                                                event.preventDefault(); // Menghentikan peristiwa default dari tautan

                                                // Mengambil elemen-elemen yang perlu diubah
                                                var asideElement = document.querySelector('aside');
                                                var navHeaderElement = document.querySelector('.nav-header');
                                                var btnResponElement = document.querySelector('.btn-respon');
                                                asideElement.classList.toggle('active');
                                                btnResponElement.classList.toggle('active');



                                                // Memeriksa apakah semua elemen ditemukan
                                                if (asideElement  && navHeaderElement && btnResponElement) {
                                                    navHeaderElement.classList.toggle('active');
                                                }

                                                // Mengaktifkan atau menonaktifkan elemen-elemen dengan kelas .respondua
                                                event.preventDefault();
                                                activate.forEach(function (element) {
                                                    element.classList.toggle("activate");
                                                });
                                            });
                                        }
                                    });




