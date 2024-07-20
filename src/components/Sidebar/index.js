/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import "./styles.css";
import {LuFileClock} from 'react-icons/lu'
import {HiUserGroup} from 'react-icons/hi'
import {VscFileSymlinkDirectory} from 'react-icons/vsc'
import {FaFileContract} from 'react-icons/fa'
import {TbReport} from 'react-icons/tb'
import { Link } from "react-router-dom";
export default function Sidebar() {

  return (
    <>
      <div class="shadow sidebar-scroll sticky-top zindex99 mt-3" style={{ overflow: 'auto',width:'220px',zIndex:99999,position:"fixed",left:0,top:60 }}>
        <ul class="sidebar-list-items" id="menu">
          <li class="sidebar-list-item pt-4 cursor-pointer">
            <Link to="/" class="nav-link align-middle px-2 nav-item">
              <HiUserGroup size={20} style={{marginBottom:'5px'}}/>
              <span class="ms-1 d-none d-sm-inline link-text text-black px-1">kProcess</span>
            </Link>
          </li>
          <li class="sidebar-list-item pt-4 cursor-pointer">
            <Link to="/productivity" class="nav-link align-middle px-2 nav-item">
             <LuFileClock size={20}/>
              <span class="ms-1 d-none d-sm-inline link-text px-1">Productivity</span>
            </Link>
          </li>
          <li class="sidebar-list-item pt-4 cursor-pointer">
            <Link to="/sustainability" class="nav-link align-middle px-2 nav-item">
             <VscFileSymlinkDirectory size={20}/>
              <span class="ms-1 d-none d-sm-inline link-text px-1">Sustainability</span>
            </Link>
          </li>
          <li class="sidebar-list-item pt-4 cursor-pointer">
            <Link to="/resilience" class="nav-link align-middle px-2 nav-item">
             <FaFileContract size={20}/>
              <span class="ms-1 d-none d-sm-inline link-text px-1">Resilience</span>
            </Link>
          </li>
          <li class="sidebar-list-item pt-4 cursor-pointer">
            <Link to="/reports" class="nav-link align-middle px-2 nav-item">
             <TbReport size={20}/>
              <span class="ms-1 d-none d-sm-inline link-text px-1">Reports</span>
            </Link>
          </li>
        </ul>
      </div>
    </>
  );
}
