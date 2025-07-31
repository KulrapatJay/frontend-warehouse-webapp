"use client";

import React from 'react';
import {
    FiSearch,
    FiUser,
    FiChevronDown
} from 'react-icons/fi';

export default function Navbar() {
    return (
        <header className="bg-base-100 flex h-16 w-full items-center justify-between gap-2 border-b border-base-300 px-4">
            {/* Search Bar */}
            <div className="form-control">
                <div className="join">
                    <button className="btn btn-ghost join-item rounded-l-full">
                        <FiSearch />
                    </button>
                    <input
                        type="text"
                        placeholder="Search..."
                        className="input input-ghost join-item w-full focus:outline-none focus:border-transparent focus:ring-0"
                    />
                </div>
            </div>

            {/* Right side User Profile */}
            <div className="flex items-center gap-2">
                <div className="dropdown dropdown-end">
                    {/* ✨ CHANGED: Updated user profile section */}
                    <label tabIndex={0} className="btn btn-ghost flex items-center gap-3 px-1">
                        {/* User Icon */}
                        <div className="avatar">
                            <div className="w-9 flex items-center justify-center">
                                <FiUser size={30} className="text-base-content/80" />
                            </div>
                        </div>
                        {/* Text block (Name & Role) */}
                        <div className='hidden md:flex md:flex-col md:items-start'>
                            <span className='font-bold text-sm'>Thomas Anree</span>
                            <span className='text-xs text-base-content/60'>UI/UX Designer</span>
                        </div>
                        {/* 1. Add Dropdown Arrow */}
                        <FiChevronDown className="ml-1" />
                    </label>
                    <ul tabIndex={0} className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52">
                        <li>
                            <a>
                                <FiUser /> Profile
                            </a>
                        </li>
                    </ul>
                </div>
            </div>
        </header>
    );
}