```
npm install
npm run dev
```
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract MovieDatabase {
    address public owner;

    struct Theatre {
        string name;
    }

    struct Movie {
        string name;
        string[] languages;
        string location;
        Theatre[] theatres;
    }

    Movie[] public movies;

    modifier onlyOwner() {
        require(msg.sender == owner, "Only the owner can perform this action");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function addMovie(
        string memory _name,
        string[] memory _languages,
        string memory _location,
        string[] memory _theatreNames
    ) public onlyOwner {
        // Create a new movie
        movies.push();
        Movie storage newMovie = movies[movies.length - 1];
        newMovie.name = _name;
        newMovie.languages = _languages;
        newMovie.location = _location;

        // Add theatres one by one
        for (uint256 i = 0; i < _theatreNames.length; i++) {
            newMovie.theatres.push(Theatre(_theatreNames[i]));
        }
    }

    function getMoviesByLocation(string memory _location)
        public
        view
        returns (string[] memory movieNames, string[][] memory movieLanguages, string[][] memory theatreNames)
    {
        uint256 count = 0;

        for (uint256 i = 0; i < movies.length; i++) {
            if (
                keccak256(abi.encodePacked(movies[i].location)) ==
                keccak256(abi.encodePacked(_location))
            ) {
                count++;
            }
        }

        movieNames = new string[](count);
        movieLanguages = new string[][](count);
        theatreNames = new string[][](count);

        uint256 index = 0;

        for (uint256 i = 0; i < movies.length; i++) {
            if (
                keccak256(abi.encodePacked(movies[i].location)) ==
                keccak256(abi.encodePacked(_location))
            ) {
                movieNames[index] = movies[i].name;
                movieLanguages[index] = movies[i].languages;

                string[] memory theatres = new string[](movies[i].theatres.length);
                for (uint256 j = 0; j < movies[i].theatres.length; j++) {
                    theatres[j] = movies[i].theatres[j].name;
                }
                theatreNames[index] = theatres;

                index++;
            }
        }

        return (movieNames, movieLanguages, theatreNames);
    }
}

Head to http://localhost:3000/api
